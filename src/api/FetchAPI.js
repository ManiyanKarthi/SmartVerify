function fetchData(props) {
  if (props.method === "GET") {
    let url = props.url;
    if (props.body) {
      let keys = Object.keys(props.body);
      if (keys.length > 0) {
        url = url + "?";
        let dt = [];
        for (var i = 0; i < keys.length; i++) {
          dt.push(keys[i] + "=" + props.body[keys[i]]);
        }
        url = url + dt.join("&");
      }
    }
    props.url = url;
  }

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if(xhr.status === 200){
        let json = {};
        if(xhr.response){
          json= JSON.parse(xhr.response);
        }
        props.success(json);
      }
      else {
        if(props.error){
          props.error(xhr.response);
        }
        else{
          console.error(xhr.response);
        }
      }
    }
  };
  xhr.open(props.method, props.url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
  xhr.timeout = props.timeout ? props.timeout : 180000;
  xhr.ontimeout = function() {
    if(props.onTimeout){
      props.onTimeout();
    }
  };
  let json;
  if(props.body){
    json = JSON.stringify(props.body);
  }
  xhr.send(json);
}

class FetchApi {
  constructor() {
    //this.baseurl = "https://montgomery-242210.appspot.com";
    this.baseurl = "http://localhost:3001";
  }

  appendURL(url){
    return this.baseurl + url;
  }

  serachEmployeeDetails(props) {
    props.url = this.baseurl + "/invoice/getinvoices";
    props.method = "GET";
    fetchData(props);
  }

  addNewBill(props) {
    props.url = this.baseurl + "/invoice/add";
    props.method = "POST";
    fetchData(props);
  }

  smartVerifyBill(props) {
    props.url = this.baseurl + "/invoice/smart-verify";
    props.method = "POST";
    fetchData(props);
  }

  getEmployeeForVerification(props) {
    props.url = this.baseurl + "/invoice/get-monthwise-invoices";
    props.method = "GET";
    fetchData(props);
  }

  getEmployeeForVerificationInvoiceDetails(props) {
    props.url = this.baseurl + "/invoice/list-employee-invoices";
    props.method = "GET";
    fetchData(props);
  }

  getInvoiceDetails(props) {
    props.url = this.baseurl + props.url;
    props.method = "GET";
    fetchData(props);
  }

  smartVerifyStoredBill(props) {
    props.url = this.baseurl + props.url;
    props.method = "GET";
    fetchData(props);
  }

  manualVerify(props){
    props.url = this.baseurl + props.url;
    props.method = "POST";
    fetchData(props);
  }

  rejectBill(props){
    props.url = this.baseurl + props.url;
    props.method = "GET";
    fetchData(props);
  }

  getAutoMLJSON(props){
    props.url = this.baseurl + props.url;
    props.method = "GET";
    fetchData(props);
  }
}

export default FetchApi;
