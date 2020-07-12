import React,{useState,useContext} from 'react'
import {Link,useHistory,useParams} from 'react-router-dom'
import {UserContext} from '../../App'
import M from 'materialize-css'

const Signin = ()=>{
    const history = useHistory()
    const [password,setPassword] = useState("")
    const {token} = useParams()
    console.log(token)

    const PostData = ()=>{

        fetch("/new-password", {
            method:"post",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                password,
                token
            }) 
        }).then(res=>res.json())
        .then(data=>{
            console.log(data)
            if(data.error){
                M.toast({html: data.error, classes:"#b71c1c red darken-4"})
            } else {
                M.toast({html:data.message,classes:"#00c853 green accent-4"})
                history.push('/signin')
            }
        }).catch(err=>{
            console.log(err)
        })
    }    

    return  (
        <div className="mycard">
            <div className="card auth-card input-field">
                <h2>Instagram</h2>
                <input type="password" placeholder="Enter New Password" value={password} onChange={(e)=>setPassword(e.target.value)}></input>
                <button className="btn waves-effect waves-light #64b5f6 blue darken-1"
                onClick={()=>PostData()}>
                    Update Password
                </button>
            </div>
        </div>
    )
}

export default Signin