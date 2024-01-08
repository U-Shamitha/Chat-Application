import React from 'react'
import './Menus.css'
import { FcAbout, FcBriefcase, FcBusinessContact, FcHome, FcParallelTasks, FcReading, FcStackOfPhotos } from "react-icons/fc";
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faClose, faHome, faMessage, faSignInAlt, faSignOutAlt, faUserAlt } from '@fortawesome/free-solid-svg-icons';
import { Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../redux/userSlice';

const Menus = ({toggle, setToggle}) => {

  const user = useSelector((state) => state.user.user);
  console.log(user) 

  const dispatch = useDispatch();

  return (

    <>
        <div className='flex justify-end'>
            <FontAwesomeIcon icon={faClose} size='lg' className='p-4 hover:text-white hover:bg-red-600' onClick={()=>setToggle(!toggle)}/>
        </div>
        <div className='navbar-profile-pic'>
        <img src={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSJfP-OoenL4RtlQsjDBWtjiVyqHL_xJleTSHD3St0bQ&s"} alt="profile pic" />
        <Typography variant="h6" sx={{ p: 2 }} style={{textAlign:'center'}}>
            {user ? user.username : 'your name'}
        </Typography>
        </div>
        <div className='nav-items'>
            <div className='nav-item'>
                {user ?
                <>
                    <Link to="/chat" onClick={()=>setToggle(!toggle)} className='nav-link'>
                        <FontAwesomeIcon icon={faMessage}/>
                        Chat
                    </Link>
                    <hr/>
                    <Link to="/profile" onClick={()=>setToggle(!toggle)} className='nav-link'>
                        <FontAwesomeIcon icon={faUserAlt}/>
                        Profile
                    </Link>
                    <hr/>
                    <Link to="/login" onClick={()=>{
                        setToggle(!toggle);
                        dispatch(setUser(null));
                        localStorage.removeItem("currentUser");
                    }
                    } className='nav-link'>
                    <FontAwesomeIcon icon={faSignOutAlt}/>
                    Logout
                    </Link>
                </>
                :         
                <Link to="/login" onClick={()=>setToggle(!toggle)} className='nav-link'>
                    <FontAwesomeIcon icon={faSignInAlt}/>
                    Login
                </Link>
                }
            </div>
            
        </div> 
    </>

  )
}

export default Menus