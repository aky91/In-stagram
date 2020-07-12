import React,{useEffect,createContext,useReducer,useContext} from 'react';
import NavBar from './Components/Navbar'
import './App.css'
import {BrowserRouter, Route, Switch,useHistory} from 'react-router-dom'
import Home from './Components/Screens/Home'
import Profile from './Components/Screens/Profile'
import Signin from './Components/Screens/Signin'
import Signup from './Components/Screens/Signup'
import CreatePost from './Components/Screens/CreatePost'
import UserProfile from './Components/Screens/UserProfile'
import SubscribedUserPosts from './Components/Screens/SubscribedUserPosts'
import {reducer,initialState} from './Reducer/userReducer'
import Reset from './Components/Screens/Reset'
import NewPassword from './Components/Screens/Newpassword'

export const UserContext = createContext()

const Routing = ()=>{
  const history = useHistory()
  const {state,dispatch} = useContext(UserContext)

  useEffect(()=>{
    const user = JSON.parse(localStorage.getItem("user"))
    if(user){
      dispatch({type:"USER",payload:user})
    } else {
      if(!history.location.pathname.startsWith('/reset')){
        history.push('/signin')
      }
    }
  },[])
  return (
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>

      <Route path="/signin">
        <Signin />
      </Route>

      <Route path="/signup">
        <Signup />
      </Route>

      <Route exact path="/profile">
        <Profile />
      </Route>

      <Route path="/createpost">
        <CreatePost />
      </Route>

      <Route path="/profile/:userid">
        <UserProfile />
      </Route>

      <Route path="/myfollowingpost">
        <SubscribedUserPosts />
      </Route>

      <Route exact path="/reset">
        <Reset />
      </Route>

      <Route path="/reset/:token">
        <NewPassword />
      </Route>

    </Switch>
  )
}

function App() {

  const [state,dispatch] = useReducer(reducer,initialState)
  return (
    <UserContext.Provider value = {{state,dispatch}} >
      <BrowserRouter>
        <NavBar />
        <Routing />
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
