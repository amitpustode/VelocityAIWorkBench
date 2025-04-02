import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";
import "../styles/headermenu.scss";

const HeaderMenu = () => {
  const menuData = useSelector((state:any) => state.app.menu);
  const [openMenu, setOpenMenu] = useState<null | string>(null);
  const [isActive, SetIsActive] = useState<string | null>(null);
  const [parentMenu, SetParentMenu] = useState<string | null>(null);

  const navigate = useNavigate();

  const location = useLocation();
  const params = new URLSearchParams(location.search);

    const page = params.get('name');
    const parentpage = params.get('parentmenu');

    useEffect(() => {
      SetIsActive(page);
      SetParentMenu(parentpage);
    },[page, location]);

    console.log(isActive);
    console.log(parentMenu);
  

    const handleMouseEnter = (menuName: string) => {
      setOpenMenu(menuName);
    };
  
    const handleMouseLeave = () => {
      setOpenMenu(null);
    };
  
    const handleMenuClick = (menuobj:any) => {
      if(menuobj.link === '/underconstruction' || menuobj.link === '/' || menuobj.link === '/codebuddy' || menuobj.link !== '/external'){
        navigate(`${menuobj.link}?parentmenu=${menuobj.name}&&header=${menuobj.header}&&link=${menuobj.link}`);
      }else{
        navigate(`/external?parentmenu=${menuobj.name}&&header=${menuobj.header}&&link=${menuobj.link}`);
      }
    };

    const handleSubMenuClick = (menuobj:any, parentmenu:any) => {
      if(menuobj.link === '/underconstruction' || menuobj.link === '/' || menuobj.link === '/codebuddy' || menuobj.link !== '/external'){
        navigate(`${menuobj.link}?name=${menuobj.name}&&parentmenu=${parentmenu.name}&&header=${menuobj.header}&&link=${menuobj.link}`);
      }else{
        navigate(`/external?name=${menuobj.name}&&parentmenu=${parentmenu.name}&&header=${menuobj.header}&&link=${menuobj.link}`);
      }
    };
  
    return (
      <div className="header-menu">
        <ul className="menu">
          {menuData.map((item:any, index:any) => (
            item.enabled === true ?
            <li
              key={index}
              className={`menu-item ${item.name === parentMenu ? 'isactive' : ''}`}
              onMouseEnter={() => handleMouseEnter(item.name)}
              onMouseLeave={handleMouseLeave}
            >
              {item.submenu ? <span className="menu-link">{item.name}</span> 
              : <span className="menu-link" onClick={() => handleMenuClick(item)}>{item.name}</span>
              }
              {item.submenu && openMenu === item.name && (
                <ul className="submenu">
                  {item.submenu.map((subitem:any, subIndex:any) => (
                    <li
                      key={subIndex}
                      className={`submenu-item ${subitem.name === isActive ? 'issubactive' : ''}`}
                      onClick={() => handleSubMenuClick(subitem, item)}
                    >
                      {subitem.name}
                    </li>
                  ))}
                </ul>
              )}
            </li> : ''
          ))}
        </ul>
      </div>
    );
  };

export default HeaderMenu;
