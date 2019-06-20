import React from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";

class BootstrapCustomTable extends React.Component {
  constructor(props) {
    super(props);

    var table = {
      insertRow: true,
      deleteRow: true,
      search: true,
      multiColumnSearch: true,
      pagination: true,
      exportCSV: true,
      version: "4"
    };

    this.state = { table: Object.assign({}, table, props.table) };

    if (this.state.table.columnList) {
      var keypresent = false;
      this.state.table.columnList.map((element, i) => {
        if (element.isKey === true) {
          keypresent = true;
        }
        return null;
      });
      if (keypresent === false) {
        this.state.table.columnList.push({
          dataField: "hiddenKey",
          dataTitle: "id",
          isKey: true,
          hidden: true
        });
        this.state.table.data.map((element, i) => {
          element["hiddenKey"] = i;
          return null;
        });
      }
    }
  }

  render() {
    var headerList = [];

    headerList = this.state.table.columnList.map((element, i) => {
      if (element.dataFormat) {
        return (
          <TableHeaderColumn
            key={i}
            isKey={element.isKey === true ? true : false}
            hidden={element.hidden === true ? true : false}
            dataSort={element.isKey === true ? true : false}
            dataField={element.dataField}
            editable={element.editable}
            dataFormat={element.dataFormatClick}
            autoValue={element.autoValue}
            dataSort
          >
            {element.dataTitle}
          </TableHeaderColumn>
        );
      } else {
        return (
          <TableHeaderColumn
            key={i}
            isKey={element.isKey === true ? true : false}
            hidden={element.hidden === true ? true : false}
            dataSort={element.isKey === true ? true : false}
            dataField={element.dataField}
            editable={element.editable}
            autoValue={element.autoValue}
            dataSort={true}
          >
            {element.dataTitle}
          </TableHeaderColumn>
        );
      }
    });

    return (
      <BootstrapTable
        data={this.props.data}
        options={this.state.table.options}
        insertRow={this.state.table.insertRow}
        deleteRow={this.state.table.deleteRow}
        selectRow={this.state.table.selectRow}
        search={this.state.table.search}
        multiColumnSearch={this.state.table.multiColumnSearch}
        pagination={this.state.table.pagination}
        cellEdit={this.state.table.cellEdit}
        exportCSV={this.state.table.exportCSV}
        version={this.state.table.version}
      >
        {headerList}
      </BootstrapTable>
    );
  }
}

export default BootstrapCustomTable;
