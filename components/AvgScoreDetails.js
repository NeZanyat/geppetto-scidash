import React from "react";
import {Card, CardText} from "material-ui/Card";
import Helper from "../common/Helper";
import ScoreDetails from "./ScoreDetails";

export default class AvgScoreDetails extends React.Component {

    constructor(props, context){
        super(props, context);

        this.helper = new Helper();

        this.props = props;

        this.state = {
            scoreList: this.props.scoreList,
            detailsShowing: false,
            currentScore: null,
            selectedScore: null
        }
        this.updateScoreDetails = this.updateScoreDetails.bind(this);
    }

    updateScoreDetails(score){
        if (this.state.currentScore != score){
            this.setState({
                currentScore: score,
                detailsShowing: true,
                selectedScore: score.get("id")
            });
        } else {
            this.setState({
                currentScore: null
            });
        }
    }

    toggleScoreDetails(score){
        this.setState({
            detailsShowing: false
        }, () => this.updateScoreDetails(score));
    }

    render(){

        let modelName = "";
        const details = this.state.detailsShowing ? <ScoreDetails scoreInstance={this.state.currentScore} /> : null;

        if (typeof this.state.scoreList != "unedfined"){
            modelName = this.state.scoreList.get(0).get('model_instance').get('model_class').get('class_name');
        }

        const columns = this.state.scoreList.map((item, index) => {

            return <td style={{
                background: this.helper.getBackground(item.get("sort_key")),
                color: "#fff",
                borderBottom: this.state.selectedScore == item.get("id") ? "2px solid red" : "none"
            }} key={"score-" + item.get("id")}>

                <a onClick={() => this.toggleScoreDetails(item)} style={{
                    cursor: "pointer",
                    color: "white"
                }}>{item.get("sort_key").toFixed(2)}</a>

            </td>;
        });
        const headings = this.state.scoreList.map((item, index) => {
            return <th className="avg-score-heading" key={"heading-" + item.get("id")}>{item.get("test_instance").get("test_class").get("class_name")}</th>;
        });

        return (
            <div>
                <Card>
                    <CardText style={{
                        overflowX: "scroll"
                    }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <td></td>
                                    {headings}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{modelName}</td>
                                    {columns}
                                </tr>
                            </tbody>
                        </table>
                    </CardText>
                </Card>
                {details}
            </div>
        );
    }
}

