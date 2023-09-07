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
                guild: metadata.guild
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
            
            {profile ? (<div className="mb-3"><h3 className="mb-3">{profile.username}</h3>
                <img className="mb-3" style={{ width: '400px' }} src={profile.avatar} /></div>)
                :
                <h4 className="mb-4">No NFT profile, please create one...</h4>}
            
            <div className="row">
                
                <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
                    
                    <div className="content mx-auto">
                        <Row>
                        <div className='select-guild'>
                            <div className="elf-guild">
                                <img src={elfselect} alt="Elf" className="image" style={{width: 245 + "px"}}/>
                                <div className="elfhover">
                                    <button className='text' onClick={elfguild}>Elves</button>
                                </div>
                            </div>
                            <div className="orc-guild">
                                <img src={orcselect} alt="Orc" className="image" style={{width: 245 + "px"}}/>
                                <div className="orchover">
                                    <button className='text' onClick={orcguild}>Orcs</button>
                                </div>
                            </div>
                            <div className="vamp-guild">
                                <img src={vampselect} alt="Vamp" className="image" style={{width:245 + "px"}}/>
                                <div className="vamphover">
                                    <button className='text' onClick={vampguild}>Vampires</button>
                                </div>
                            </div>
                            <div className="nord-guild">
                                <img src={nordselect} alt="Nord" className="image" style={{width: 245 + "px"}}/>
                                <div className="nordhover">
                                    <button className='text' onClick={nordguild}>Nord</button>
                                </div>
                            </div>
                        </div>
                        </Row>
                        <Row className="g-4">
                            <Form.Control
                                type="file"
                                required
                                name="file"
                                onChange={uploadToIPFS}
                            />
                            <Form.Control onChange={(e) => setUsername(e.target.value)} size="lg" required type="text" placeholder="Username" />
                            <div className="d-grid px-0">
                                <Button onClick={mintProfile} variant="primary" size="lg">
                                    Mint NFT Profile
                                </Button>
                            </div>
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
                                <Card>
                                    <Card.Img variant="top" src={nft.avatar} />
                                    <Card.Body color="secondary">
                                        <Card.Title>{nft.username}</Card.Title>
                                    </Card.Body>
                                    <Card.Footer>
                                        <div className='d-grid'>
                                            <Button onClick={() => switchProfile(nft)} variant="primary" size="lg">
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