import React from "react";
import UIFields from "./UIFields";
class UIFieldsGeneral extends React.Component {
  render() {
    return (
      <div style={{ paddingTop: "50px", textAlign: "center" }}>
        {this.props.mapList.map((r, i) => {
          var fields = r.fields;
          return (
            <UIFields
              key={i}
              f1type={fields[0].type}
              f2type={fields[1].type}
              f3type={fields[2].type}
              f1field={fields[0].field}
              f2field={fields[1].field}
              f3field={fields[2].field}
              f1required={fields[0].required}
              f2required={fields[1].required}
              f3required={fields[2].required}
              f1label={fields[0].label}
              f2label={fields[1].label}
              f3label={fields[2].label}
              f1validateflag={fields[0].validateflag}
              f1value={fields[0].value}
              f1onChange={fields[0].onChange}
              f1selectList={fields[0].selectList}
              f2validateflag={fields[1].validateflag}
              f2value={fields[1].value}
              f2onChange={fields[1].onChange}
              f2selectList={fields[1].selectList}
              f3validateflag={fields[2].validateflag}
              f3value={fields[2].value}
              f3onChange={fields[2].onChange}
              f3selectList={fields[2].selectList}
              f1onClick={fields[0].f1onClick}
              f2onClick={fields[1].f1onClick}
              f3onClick={fields[2].f1onClick}
            />
          );
        })}
      </div>
    );
  }
}

export default UIFieldsGeneral;
