var formatAMPM = date => {
  if (date) {
    var datevalue = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();

    // var hours = date.getHours();
    // var minutes = date.getMinutes();
    // var ampm = hours >= 12 ? 'PM' : 'AM';
    // hours = hours % 12;
    // hours = hours ? hours : 12; // the hour '0' should be '12'
    // minutes = minutes < 10 ? '0'+minutes : minutes;
    month = month < 10 ? "0" + month : month;

    //var strTime = month +'/' +datevalue+'/'+year+' '+ hours + ':' + minutes + ' ' + ampm;
    var strTime = year + "-" + month + "-" + datevalue;
    return strTime;
  }
};

export { formatAMPM };
