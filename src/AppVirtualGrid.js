import React, { Component } from 'react';
import { VirtualGrid } from './component/VirtualGrid';
export default class AppVirtualGridExample extends React.Component {

  constructor(props) {
	super(props);
  }
       render() {
    return (
      <VirtualGrid  getPromise={this.getPromise.bind(this)} width="1000" height="800" itemHeight={200} itemWidth={200}></VirtualGrid>
    );
  }

  getPromise(index){
	  if (index < 0) {
		return Promise.resolve(null);
	  }
    return new Promise(function(resolve, reject) {
        setTimeout(function(){
                        resolve(<div style={{height: 190 + 'px', backgroundColor: '#7DCEA0', width:190 + 'px' , display:'table-cell', verticalAlign:'middle'}}><h2 style={{color: '#555', textAlign : 'center' }}>{index}</h2></div>);
                  }, Math.random()*(10000)+1000);
        });
  }
}