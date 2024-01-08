import  React,{useState, useEffect} from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import Menus from './Menus/Menus';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../redux/userSlice';

const Navbar=()=>{
  
  const user = useSelector((state) => state.user.user);
  console.log(user)
  const [showSidebar, setShowSidebar] = useState(false);

  const dispatch = useDispatch();

  return (
    <Box component="main"
    sx={{
      flexGrow: 1,
      marginLeft: showSidebar ? '250px' : '0',
      transition: 'margin-left 0.3s ease',
    }}>
      <AppBar width="100vw" color='transparent' style={{backgroundColor:'white', height:'60px', zIndex: showSidebar ? 10 : 1100}} >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block', "&:hover": { color: "blue"} }}}
          >
            <Link to="/" style={{ textDecoration: 'none' }}>Chat Application</Link>
          </Typography>
          {user ?
          <div style={{display:"flex"}}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button
                onClick={() => {
                  dispatch(setUser(null))
                  localStorage.removeItem("currentUser");
                  console.log(user);
                }}
                sx={{ my: 2, color: "black", display: "block", "&:hover": { color: "blue"}, alignSelf:'flex-end'}}
            >
                Logout
            </Button>
            </Link>
          </div>
          :
          <div style={{display:"flex"}}>
            <Link to="/signup" style={{ textDecoration: 'none' }}>
            <Button
                onClick={() => {}}
                sx={{ my: 2, color: "black", display: "block", "&:hover": { color: "blue"}}}
            >
                SignUp
            </Button>
            </Link>
            <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button
                onClick={() => {}}
                sx={{ my: 2, color: "black", display: "block", "&:hover": { color: "blue"}}}
            >
                Login
            </Button>
            </Link>
          </div>
          }
        </Toolbar>
      </AppBar>

      {showSidebar && (
        <div style={{ width: '250px', backgroundColor: 'white', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex:'1100', boxShadow:'0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)' }}>
          <Menus toggle={showSidebar} setToggle={setShowSidebar}/>
        </div>
      )}
    </Box>
  );
}

export default Navbar;
