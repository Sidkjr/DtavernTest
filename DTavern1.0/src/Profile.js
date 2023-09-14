import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button, Card, ListGroup, Col } from 'react-bootstrap'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { Buffer } from 'buffer';
import elfselect from './images/elfselect.png'
import orcselect from './images/orcselect.png'
import vampselect from './images/vampselect.png'
import nordselect from './images/nordselect.png'

// @ts-ignore
window.Buffer = Buffer;

const projectID = "2UsxCEiYOZuQn3LZ160mAOuddrj";
const projectSecretKey = "7e5ae5643b03e08bcb45c21677ec3add";
const auth = `Basic ${Buffer.from(`${projectID}:${projectSecretKey}`).toString("base64")}`;

const client = ipfsHttpClient({
    host: "infura-ipfs.io",
    port: 5001,
    protocol: "https",
    headers: {
        authorization: auth,
    },
});


const App = ({ contract }) => {
    const [profile, setProfile] = useState('')
    const [nfts, setNfts] = useState('')
    const [avatar, setAvatar] = useState(null)
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(true)
    const [guild, setGuild] = useState(null)
    const [createNewProfile, setNewProfile] = useState(null)
    const loadMyNFTs = async () => {
        // Get users nft ids
        const results = await contract.getMyNfts();
        // Fetch metadata of each nft and add that to nft object.
        let nfts = await Promise.all(results.map(async i => {
            // get uri url of nft
            const uri = await contract.tokenURI(i)
            // fetch nft metadata
            console.log(uri);
            const response = await fetch(uri);
            const metadata = await response.json();
            console.log(metadata)
                // Do something with the JSON data
            return ({
                id: i,
                username: metadata.username,
                avatar: metadata.avatar,
                updatedguild: metadata.guild
            })
            
        }))
        setNfts(nfts)
        getProfile(nfts)
    }
    const getProfile = async (nfts) => {
        const address = await contract.signer.getAddress()
        const id = await contract.profiles(address)
        const profile = nfts.find((i) => i.id.toString() === id.toString())
        setProfile(profile)
        setLoading(false)
    }
    const uploadToIPFS = async (event) => {
        event.preventDefault()
        const file = event.target.files[0]
        if (typeof file !== 'undefined') {
            try {
                const result = await client.add(file)
                setAvatar(`https://dtavern.infura-ipfs.io/ipfs/${result.path}`)
            } catch (error) {
                console.log("ipfs image upload error: ", error)
            }
        }
    }
    const mintProfile = async (event) => {
        if (!avatar || !username) return
        try {
            const result = await client.add(JSON.stringify({ avatar, username, guild }))
            setLoading(true)
            await (await contract.mint(`https://dtavern.infura-ipfs.io/ipfs/${result.path}`)).wait()
            loadMyNFTs()
        } catch (error) {
            window.alert("ipfs uri upload error: ", error)
        }
    }
    const switchProfile = async (nft) => {
        setLoading(true)
        await (await contract.setProfile(nft.id)).wait()
        getProfile(nfts)
    }

    const leaveGuild = async => {
        setGuild('')
    }

    const addProfile = async => {
        setNewProfile(true)
    }
    const cancelNewProfile = async => {
        setNewProfile(null)
        setGuild(null)
    }

    const elfguild = async => {
        setGuild('Elf')
        console.log(guild)
    }
    const orcguild = async => {
        setGuild('Orc')
        console.log(guild)
    }
    const vampguild = async => {
        setGuild('Vamp')
        console.log(guild)
    }
    const nordguild = async => {
        setGuild('Nord')
        console.log(guild)
    }

    const setStyle = async => {
        let styles = []
        if (profile.updatedguild == 'Elf') {
            const elfStyle = {
                background: 'aqua linear-gradient(to top, black, aqua)', 
                width: '400px', 
                position: 'inherit', 
                borderRadius: '12%', 
                height: '420px', 
                paddingTop: '20px', 
                marginLeft: '37%'
            }
            styles = Object.assign(styles, elfStyle)
        }
        if (profile.updatedguild == 'Orc') {
            const orcStyle = {
                background: 'green linear-gradient(to top, black, green)', 
                width: '400px', 
                position: 'inherit', 
                borderRadius: '12%', 
                height: '420px', 
                paddingTop: '20px', 
                marginLeft: '37%'
            }
            styles = Object.assign(styles, orcStyle)
        }
        if (profile.updatedguild == 'Vamp') {
            const vampStyle = {
                background: 'red linear-gradient(to top, black, red)', 
                width: '400px', 
                position: 'inherit', 
                borderRadius: '12%', 
                height: '420px', 
                paddingTop: '20px', 
                marginLeft: '37%'
            }
            styles = Object.assign(styles, vampStyle)
        }
        if (profile.updatedguild == 'Nord') {
            const nordStyle = {
                background: 'gold linear-gradient(to top, black, gold)', 
                width: '400px', 
                position: 'inherit', 
                borderRadius: '12%', 
                height: '420px', 
                paddingTop: '20px', 
                marginLeft: '37%'
            }
            styles = Object.assign(styles, nordStyle)
        }
        return styles
    }

    const setselectedGuildclass = async => {
        let classSelect = null
        if (guild == 'Elf') {
           classSelect = 'elf-guild'
        }
        if (guild == 'Orc') {
            classSelect = 'orc-guild'
        }
        if (guild == 'Vamp') {
            classSelect = 'vamp-guild'
        }
        if (guild == 'Nord') {
            classSelect = 'nord-guild'
        }
        return classSelect
    }

    const setselectedGuildimage = async => {
        let imgselect = null
        if (guild == 'Elf') {
           imgselect = elfselect
        }
        if (guild == 'Orc') {
            imgselect = orcselect
        }
        if (guild == 'Vamp') {
            imgselect = vampselect
        }
        if (guild == 'Nord') {
            imgselect = nordselect
        }
        return imgselect
    }

    const setselectedGuildstyle = async => {
        let selectedstyles = {}
        if (guild == 'Elf') {
            const selectElfStyle = {
                background: 'aqua linear-gradient(to top, black, aqua)', 
                padding: '20px', 
                marginBottom: '30px', 
                borderRadius: '15px'
            }
            selectedstyles = Object.assign(selectedstyles, selectElfStyle)
        }
        if (guild == 'Orc') {
            const selectOrcStyle = {
                background: 'green linear-gradient(to top, black, green)', 
                padding: '20px', 
                marginBottom: '30px', 
                borderRadius: '15px'
            }
            selectedstyles = Object.assign(selectedstyles, selectOrcStyle)
        }
        if (guild == 'Vamp') {
            const selectVampStyle = {
                background: 'red linear-gradient(to top, black, red)', 
                padding: '20px', 
                marginBottom: '30px', 
                borderRadius: '15px'
            }
            selectedstyles = Object.assign(selectedstyles, selectVampStyle)
        }
        if (guild == 'Nord') {
            const selectNordStyle = {
                background: 'gold linear-gradient(to top, black, gold)', 
                padding: '20px', 
                marginBottom: '30px', 
                borderRadius: '15px'
            }
            selectedstyles = Object.assign(selectedstyles, selectNordStyle)
        }
        return selectedstyles
    }
    useEffect(() => {
        if (!nfts) {
            loadMyNFTs()
        }
    })
    
    if (loading) return (
        <div className='text-center'>
            <main style={{ padding: "1rem 0" }}>
                <h2>Loading...</h2>
            </main>
        </div>
    )
    return (
        <div className="mt-4 text-center">
            
            {profile ? (
                <div>
                    <h3 className='mb-3 text-left' style={{color: 'white', textShadow: '1px 1px gold, 1px 1px black', fontSize: '55px'}}>Your Profile</h3>
                    <hr></hr>
                    <div className="mb-3" style={setStyle()}>
                        <h3 className="mb-3" style={{color: 'whitesmoke', textShadow: '1px 1px gold, 1px 1px black', fontSize: '35px'}}>{profile.username}</h3>
                        <img className="mb-3" style={{ width: '300px' , borderRadius: '12%'}} src={profile.avatar} />
                    </div>
                </div>
                )
                :
                <h4 className="mb-4">No NFT profile, please create one...</h4>}
            
            <div className="row">
                
                <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
                    
                    <div className="content mx-auto">
                        <Row>
                            { createNewProfile ? (
                                <div>
                                    { guild ? (
                                        <div>
                                                <div className={setselectedGuildclass()} style={setselectedGuildstyle()}>
                                                    <img src={setselectedGuildimage()} style={{width: 185 + "px"}}/>
                                                </div>
                                    
                                            <Row className='g-4'>
                                                <Button onClick={leaveGuild} variant="outline-warning" size="lg" style={{marginBottom: '20px'}}>Change Guild</Button>
                                            </Row>
                                            
                                        </div>): (
                                            <div>
                                                <Row>
                                                    <h3 className='mb-3 text-left' style={{color: 'white', textShadow: '1px 1px gold, 1px 1px black', fontSize: '55px'}}>Select your Guild</h3>
                                                    <hr></hr>
                                                </Row>
                                                <div className='select-guild'>
                                                    
                                                    <div className="elf-guild" style={{background: 'aqua linear-gradient(to top, black, aqua)', padding: '20px', marginBottom: '30px', borderRadius: '15px'}}>
                                                        <img src={elfselect} alt="Elf" className="image" style={{width: 185 + "px"}}/>
                                                        <div className="elfhover" style={{position: 'relative'}}>
                                                            <button className='elf-text' onClick={elfguild}>Elves</button>
                                                        </div>
                                                    </div>
                                                    <div className="orc-guild" style={{background: 'green linear-gradient(to top, black, green)', padding: '20px', marginBottom: '30px', borderRadius: '15px'}}>
                                                        <img src={orcselect} alt="Orc" className="image" style={{width: 185 + "px" }}/>
                                                        <div className="orchover" style={{position: 'relative'}}>
                                                            <button className='orc-text' onClick={orcguild}>Orcs</button>
                                                        </div>
                                                    </div>
                                                    <div className="vamp-guild" style={{background: 'red linear-gradient(to top, black, red)', padding: '20px', marginBottom: '30px', borderRadius: '15px'}}>
                                                        <img src={vampselect} alt="Vamp" className="image" style={{width:185 + "px"}}/>
                                                        <div className="vamphover" style={{position: 'relative'}}>
                                                            <button className='vamp-text' onClick={vampguild}>Vampires</button>
                                                        </div>
                                                    </div>
                                                    <div className="nord-guild" style={{background: 'gold linear-gradient(to top, black, gold)', padding: '20px', marginBottom: '30px', borderRadius: '15px'}}>
                                                        <img src={nordselect} alt="Nord" className="image" style={{width: 185 + "px"}}/>
                                                        <div className="nordhover" style={{position: 'relative'}}>
                                                            <button className='nord-text' onClick={nordguild}>Nord</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                    <Row className="g-4">
                                        <Form.Control
                                            type="file"
                                            required
                                            name="file"
                                            onChange={uploadToIPFS}
                                        />
                                        <Form.Control onChange={(e) => setUsername(e.target.value)} size="lg" required type="text" placeholder="Username" />
                                        <div className="d-grid px-0">
                                            <Button onClick={mintProfile} variant="outline-warning" size="lg" disabled={!guild} style={{marginBottom: '20px'}}>
                                                Mint NFT Profile
                                            </Button>
                                            <Button onClick={cancelNewProfile} variant="outline-danger" size="lg" style={{marginBottom: '20px'}}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </Row>
                                </div>
                                ) 
                                : (<Row>
                                    <Button onClick={addProfile} variant="outline-warning" size="lg" style={{marginBottom: '20px'}}>Add Profile</Button>
                                </Row>)
                                
                            }
                                
                        </Row>
                    </div>
                    
                </main>
            </div>
            
            <div className="px-5 container">
                <Row xs={1} md={2} lg={4} className="g-4 py-5">
                    {nfts.map((nft, idx) => {
                        if (nft.id === profile.id) return
                        return (
                            <Col key={idx} className="overflow-hidden">
                                <Card style={{padding: '20px', background: 'grey linear-gradient(to top, black, grey)', borderRadius: '6%'}}>
                                    <Card.Img variant="top" src={nft.avatar} style={{borderRadius: '6%', width: '250px'}}/>
                                    <Card.Body color="secondary">
                                        <Card.Title style={{color: 'whitesmoke'}}>{nft.username}</Card.Title>
                                    </Card.Body>
                                    <Card.Footer>
                                        <div className='d-grid'>
                                            <Button onClick={() => switchProfile(nft)} variant="outline-warning" size="lg">
                                                Set as Profile
                                            </Button>
                                        </div>
                                    </Card.Footer>
                                </Card>
                            </Col>
                        )
                    })}
                </Row>
                
            </div>
        </div>
    );
}

export default App;