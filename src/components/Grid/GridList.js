import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import Grid from '@material-ui/core/Grid';


 
class GridListObject extends React.Component {
 
	constructor(props){
		super(props);
		
		this.state = {
			tileData:props.tileData
		}
		
	}



  
  render() {


		  return (
			<div style={{"paddingTop":"20px","textAlign":"center"}}>
			  <GridList  cols={3}>
			 <Grid>
			 </Grid>
			 <Grid>
				 dsfdsf
			 </Grid>
			 <Grid>
				 dsfdsf
			 </Grid>
			  </GridList>
			</div>
		  );
	}

}

export default GridListObject;