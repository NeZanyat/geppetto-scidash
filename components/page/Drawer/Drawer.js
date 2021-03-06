import React from "react";
import Drawer from "material-ui/Drawer";
import Divider from "material-ui/Divider";
import MenuItem from "material-ui/MenuItem";
import IconButton from "material-ui/IconButton";
import NavigationMenu from "material-ui/svg-icons/navigation/menu";
import ScidashLogo from "../../../assets/scidash_logo.png";
import PagesService from "../../../services/PagesService";

export default ({ drawerActive, changePage, toggleDrawer, activePage, editModelActive, editTestActive, userLogged }) => {
  const pagesService = new PagesService();

  const handleMenuClick = page => {
    changePage(page);
    toggleDrawer();
  };

  const handleClickUserLogged = page => {
    if(userLogged) {
      handleMenuClick(page);
    } else {
      handleMenuClick(pagesService.SCORES_PAGE);
    }
  }

  return (
    <div>
      <IconButton
        id="hamMenu"
        onClick={() => toggleDrawer()}
      >
        <NavigationMenu />
      </IconButton>
      <Drawer
        width={265}
        docked={false}
        open={drawerActive}
        onRequestChange={() => toggleDrawer()}
      >
        <img style={styles.logo} src={ScidashLogo} alt="" />
        <Divider />
        <MenuItem
          id="hamMenuScores"
          primaryText="Test scores"
          leftIcon={<i className="fa fa-star-half-o drawer-icon" />}
          onClick={() => handleMenuClick(pagesService.SCORES_PAGE)}
        />

        <MenuItem
          id="hamMenuSuites"
          primaryText="Suite scores"
          leftIcon={<i className="fa fa-suitcase drawer-icon" />}
          onClick={() => handleMenuClick(pagesService.SUITES_PAGE)}
        />

        {userLogged == true 
        ? (<MenuItem
            id="hamMenuTests"
            primaryText="Tests"
            onClick={() => handleMenuClick(pagesService.TESTS_PAGE)}
            leftIcon={<i className="fa fa-laptop drawer-icon" />}
            disabled={!userLogged}
          />) 
        : (<span data-tooltip-right="User must be logged in to view this page">
          <MenuItem
            id="hamMenuTests"
            primaryText="Tests"
            onClick={() => handleMenuClick(pagesService.TESTS_PAGE)}
            leftIcon={<i className="fa fa-laptop drawer-icon" />}
            disabled={!userLogged}
          />
        </span>)}

        {userLogged == true 
        ? (<MenuItem
            id="hamMenuModels"
            primaryText="Models"
            onClick={() => handleMenuClick(pagesService.MODELS_PAGE)}
            leftIcon={<i id="gpt-3dshow" className="gpt-3dshow drawer-icon" />}
            disabled={!userLogged}
          />) 
        : (<span data-tooltip-right="User must be logged in to view this page">
          <MenuItem
            id="hamMenuModels"
            primaryText="Models"
            onClick={() => handleMenuClick(pagesService.MODELS_PAGE)}
            leftIcon={<i id="gpt-3dshow" className="gpt-3dshow drawer-icon" />}
            disabled={!userLogged}
          />
        </span>)}

        <MenuItem
          id="hamMenuSettings"
          primaryText="Settings"
          leftIcon={<i className="fa fa-cogs drawer-icon" />}
          onClick={() => handleMenuClick(pagesService.SETTINGS_PAGE)}
        />

        {userLogged == true 
        ? (<MenuItem
            id="hamMenuScheduling"
            primaryText="Scheduling"
            leftIcon={<i className="fa fa-calendar drawer-icon" />}
            onClick={() => handleMenuClick(pagesService.SCHEDULING_PAGE)}
            disabled={!userLogged}
          />) 
        : (<span data-tooltip-right="User must be logged in to view this page">
          <MenuItem
            id="hamMenuScheduling"
            primaryText="Scheduling"
            leftIcon={<i className="fa fa-calendar drawer-icon" />}
            onClick={() => handleMenuClick(pagesService.SCHEDULING_PAGE)}
            disabled={!userLogged}
          />
        </span>)}
      </Drawer>
    </div>
  );

};

// FIXME: move styles to scidash.less
const styles = {
  logo: {
    width: 205,
    marginTop: 5,
    marginLeft: 25,
    marginBottom: 8,
  },
};
