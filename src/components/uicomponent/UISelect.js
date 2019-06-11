import React from 'react';


class UISelect extends React.Component {
    render() {

        return (<select className="form-control" style={{ borderColor: this.props.validateflag ? "#b94a48" : "#aaa"}} value={this.props.value} onChange={this.props.onChange} >
                                    <option key={"select"} >--Select--</option>
                                    {this.props.selectList.map((res,i) => {
                                        var options;
                                       if(res.key){
                                           options =<option key={res.key}  >{res.value}</option>
                                       } else if(res.keyvalue){ 
                                         options =<option key={res.keyvalue} value={res.keyvalue} >{res.value}</option>;
                                       } else {
                                           options =<option key={i} >{res}</option>;
                                       }

                                    return options;
                                    })}
           </select>
        )
    }

}

export default UISelect; 