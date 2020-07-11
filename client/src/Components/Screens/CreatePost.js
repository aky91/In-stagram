import React,{useState,useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import M from 'materialize-css'

const CreatePost = ()=>{

    const history = useHistory()
    const [title,setTitle] = useState("")
    const [body,setBody] = useState("")
    const [image,setImage] = useState("")
    const [url,setURL] = useState("")

    //useEffect is used to make the backend req only after we receive url
    useEffect(()=>{
        if(url){
        //post request to backend
            fetch("/createpost", {
                method:"post",
                headers:{
                    "Content-Type":"application/json",
                    "Authorization":"Bearer "+localStorage.getItem("jwt")
                },
                body:JSON.stringify({
                    title,
                    body,
                    pic:url
                }) 
            }).then(res=>res.json())
            .then(data=>{
                console.log(data)
                if(data.error){
                    M.toast({html: data.error, classes:"#b71c1c red darken-4"})
                } else {
                    M.toast({html:"Post Created Successfully",classes:"#00c853 green accent-4"})
                    history.push('/')
                }
            }).catch(err=>{
                console.log(err)
            })
        }
    },[url])


    const postDetails = ()=>{
        const data = new FormData()
        data.append("file",image)
        data.append("upload_preset","insta-clone")
        data.append("cloud_name","ay")
        
        //post request to save image in cloudinary
        fetch("https://api.cloudinary.com/v1_1/ay/image/upload",{
            method:"post",
            body:data
        }).then(res=>res.json())
        .then(data=>{
            setURL(data.url)
        })
        .catch(err=>{
            console.log(err)
        })


    }

    return (
        <div className="card input-field" 
        style={{
            margin:"30px auto",
            maxWidth:"500px",
            padding:"20px",
            textAlign:"center"
        }}
        >
            <input 
            type="text" 
            placeholder="Title"
            value = {title}
            onChange={(e)=>setTitle(e.target.value)}
            />

            <input 
            type="text" 
            placeholder="Body"
            value = {body}
            onChange={(e)=>setBody(e.target.value)}
            />

            <div className="file-field input-field">
                <div className="btn #64b5f6 blue darken-1">
                    <span>Upload Image</span>
                    <input type="file" onChange={(e)=>setImage(e.target.files[0])}/>
                </div>
                <div className="file-path-wrapper">
                    <input className="file-path validate" type="text"/>
                </div>
            </div>

            <button className="btn waves-effect waves-light #64b5f6 blue darken-1"
            onClick={()=>{postDetails()}}
            >
                Submit Post
            </button>

        </div>
    )
}

export default CreatePost