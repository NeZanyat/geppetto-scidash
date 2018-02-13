import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

const customContentStyle = {
    width: '900px',
    height: '900px'
};

export default class ScidashModelDetailLinkColumn extends React.Component {
    constructor(props, context){
        super(props, context)
        this.props = props;
        this.openModelDetail = this.openModelDetail.bind(this);
        this.closeModelDetail = this.closeModelDetail.bind(this);
        this.state = {
            open: false,
            modelObject: null
        };
    }

    componentDidMount(){
        this.setState({
            modelObject: this.props.value
        })
    }

    componentWillReceiveProps(nextProps, nextState){
        this.setState({
            modelObject: nextProps.value
        });
    }

    openModelDetail(e){
        e.preventDefault()
        this.setState({
            open:true
        });
    }

    closeModelDetail(e){
        e.preventDefault()
        this.setState({
            open:false
        });
    }

    render(){

        const actions = [
            <FlatButton
            label="Close"
            primary={true}
            onClick={this.closeModelDetail}
            />,
        ];

        let class_name = "";

        if (this.state.modelObject !== null){
            class_name = this.state.modelObject.get('class_name');

            return (
                <div>
                <a
                onClick={this.openModelDetail}
                style={{
                    cursor: "pointer"
                }}
                >{class_name}</a>
                <Dialog
                title={class_name + " details"}
                actions={actions}
                modal={true}
                contentStyle={customContentStyle}
                open={this.state.open}
                >
                This is the details of model {class_name}
                </Dialog>
                </div>
            );
        } else {
            console.log("NULL DATA");
            return (<span></span>);
        }
    }
}