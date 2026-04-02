import { Tooltip } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navigator = (props: any) => {
  const location = usePathname();

  const { name, path, navIcon, onClick, navSVG, navIconImg, key, path2 , path3 , path4 , path5, path6, path7, path8, external } =
    props;
  const hasSubmenu = !!props?.children;
  const activeClass =
    location === path || location === path2 || location === path3 || location === path4 || location === path5 || location === path6 || location === path7 || location === path8 ? "activeMenu" : "";

  return (
    <>
      <li onClick={onClick} key={key}>
        <Tooltip title={name} placement="right">
          {hasSubmenu ? (
            <a href="#" className={`${activeClass} betBox`}>
              <div>
                {navIconImg ? (
                  <>
                    <img src={navIconImg} alt="" />
                  </>
                ) : navIcon ? (
                  <>
                    <i className={navIcon}></i>
                  </>
                ) : (
                  <>{navSVG}</>
                )}
                <span className="text-capitalize ms-3 my-auto subtext">{name}</span>
              </div>
              <i className="ri-arrow-right-s-line fs-18"></i>
            </a>
          ) : external ? (
            <a href={path} target="_blank" rel="noreferrer" className={`${activeClass} betBox`}>
              <div>
                {navIconImg ? (
                  <>
                    <img src={navIconImg} alt="" />
                  </>
                ) : navIcon ? (
                  <>
                    <i className={navIcon}></i>
                  </>
                ) : (
                  <>{navSVG}</>
                )}
                <span className="text-capitalize ms-3 my-auto subtext">{name}</span>
              </div>
            </a>
          ) : path === "#" ? (
            <a href="#" className={`${activeClass} betBox`} onClick={(e) => e.preventDefault()}>
              <div>
                {navIconImg ? (
                  <>
                    <img src={navIconImg} alt="" />
                  </>
                ) : navIcon ? (
                  <>
                    <i className={navIcon}></i>
                  </>
                ) : (
                  <>{navSVG}</>
                )}
                <span className="text-capitalize ms-3 my-auto subtext">{name}</span>
              </div>
            </a>
          ) : (
            <Link href={{ pathname: path }} className={`${activeClass} betBox`}>
              <div>
                {navIconImg ? (
                  <>
                    <img src={navIconImg} alt="" />
                  </>
                ) : navIcon ? (
                  <>
                    <i className={navIcon}></i>
                  </>
                ) : (
                  <>{navSVG}</>
                )}
                <span className="text-capitalize ms-3 my-auto subtext">{name}</span>
              </div>
            </Link>
          )}
        </Tooltip>
        {/* If Submenu */}
        {props.children && (
          <Tooltip title={name} placement="right">
            {props.children}
          </Tooltip>
        )}
      </li>
    </>
  );
};

export default Navigator;
