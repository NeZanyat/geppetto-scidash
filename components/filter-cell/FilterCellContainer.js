import { connect } from "react-redux"
import FilterCell from "./FilterCell"
import ScoreApiService from "../../services/api/ScoreApiService"

const mapStateToProps = (state, ownProps) => {
    let namespace = ownProps.namespace;
    let currentFilters = new ScoreApiService().getFilters(namespace)
    let filterName = ownProps.filterName
    let value = ""

    if (filterName in currentFilters) value = currentFilters[filterName]
    else value = ""

    return {
        title: ownProps.title,
        icon: ownProps.icon,
        styleDefault: {
            width: "100px",
            height: "28px",
            marginRight: "5px",
        },
        menuStyle: {
            width: "180px",
        },
        listStyle: {
            width: "180px",
        },
        styleInputDefault: {
            width: "100px",
            height: "28px",
            border: "1px solid #ccc",
        },
        autoCompleteData: ownProps.autoCompleteData,
        columnId: ownProps.columnId,
        onFilterUpdate: ownProps.onFilterUpdate,
        value,
        filterName,
        currentFilters,
    }
}

const mapDispatchToProps = dispatch => {
    return {}
}

const FilterCellContainer = connect(mapStateToProps, mapDispatchToProps)(
    FilterCell
)

export default FilterCellContainer