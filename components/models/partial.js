import React, { Component } from "react";
import Menu from 'material-ui/Menu';
import Chip from 'material-ui/Chip';
import Popover from 'material-ui/Popover';
import FontIcon from 'material-ui/FontIcon';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import {red400, brown500} from 'material-ui/styles/colors';


const styles = {
  anchorOrigin: {
    vertical: "center",
    horizontal: "left",
  },
  targetOrigin: {
    vertical: "center",
    horizontal: "right",
  },
};

export class CustomMenu extends Component {
  constructor (props) {
    super(props);
    this.state = {
      anchorEl: null
    };

    this.isBlocked = this.isBlocked.bind(this);
    this.checkInstance = this.checkInstance.bind(this);
  }

  isBlocked() {
    if(this.props.value === false) {
      return false;
    }
    if(this.props.value === undefined) {
      return false
    }
    if(this.props.value.get("isBlocked")) {
      return true;
    }
    var instanceId = this.props.value.get("modelId");
    var checkInstance = function(value, index, array) { return value.id === instanceId };
    var instance = this.props.data.find(checkInstance);
    if((instance.tags.indexOf("deprecated") !== -1)) {
      return true;
    }
    return false;
  }

  checkInstance() {
    if(this.props.value === false || this.props.value === undefined) {
      return false
    } else {
      return true;
    }
  }

  render () {
    const { anchorEl } = this.state;
    return (
      <span className="edit-clone-test">
        { this.isBlocked() && <FontIcon className="fa fa-lock" /> }
        { this.checkInstance() && <IconButton
          iconClassName="fa fa-ellipsis-v"
          onClick={e => this.setState({ anchorEl: e.currentTarget })}
        /> }

        <Popover
          open={!!anchorEl}
          anchorEl={anchorEl}
          anchorOrigin={styles.anchorOrigin}
          targetOrigin={styles.targetOrigin}
          onRequestClose={() => this.setState({ anchorEl: null })}
        >
          <Menu>
            <MenuItem
              primaryText="Edit"
              onClick={() => this.props.edit(this.props.value.get("modelId"))}
              leftIcon={<FontIcon className="fa fa-pencil-square-o" />}
            />
            <MenuItem
              primaryText="Clone"
              onClick={() => this.props.clone(this.props.value.get("modelId"))}
              leftIcon={<FontIcon className="fa fa-clone" />}
            />
          </Menu>
        </Popover>
      </span>
    );
  }
}

export const CustomTagComponent = ({ value }) => (
  <span className="chips">
    {value.map((tag, i) => <Chip backgroundColor={tag.toLowerCase() === "deprecated" ? red400 : brown500} containerElement="span" key={i}>{tag}</Chip>)}
  </span>
);
