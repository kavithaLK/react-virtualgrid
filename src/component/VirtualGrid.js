import React, { Component } from 'react';
import { Nav, NavbarHeader, Navbar, NavItem, NavDropdown, MenuItem, FormGroup, FormControl,Button } from 'react-bootstrap';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import  VerticalScrollbar  from  './virtual-scrollbar.js';
import  {LRUCache} from 'js-lru/lru.js';
//import  ReactCSSTransitionGroup from 'react-addons-css-transition-group';

require('./_Scrollbar.sass')

export class VirtualGrid extends React.Component {
	constructor(props){
		super(props);
		this.initialOffset = -this.props.itemHeight;
        let cachenew = new LRUCache(1000);
		this.numberOfDiv = Math.floor(this.props.height/this.props.itemHeight);
		this.numberofColumns = Math.ceil(this.props.width/this.props.itemWidth);
		this.numBufferExtraElements = 1; // applies to both ends for the viewPort
		this.maxRange = this.props.height;
		this.numberofItemsTobeLoadedInAdvance =  this.numberOfDiv + (5 * this.numBufferExtraElements);

		this.state = {
			startIndexRow:0, /* index from which data is to be fetched */
			offset: this.initialOffset, /*Amount you have scrolled within a item */
			vMovement:0,  /*  */
			scrollAreaHeight: 100, /* Content Height */
			scrollWrapperHeight:20, /* Wrapper Height */
            getPromise :function (index){},
            components : [],
            cache:{},
            lrucache:cachenew,
            maxLoadedElements: (2 * this.numberOfDiv) + 5 * this.numBufferExtraElements
		}

	}

	// from start index to  number of rows on screen + buffers 
	getRangeElements() {
		return this.state.startIndexRow + this.numberOfDiv + this.numBufferExtraElements;
	}
	//
	getMaxOffset() {
		return	2 * this.numBufferExtraElements * this.props.itemHeight;
	}

	// pushing button down and  virtual scrolling up
	getDown(stepIncrementRaw){
		let stepIncrement = stepIncrementRaw;
		let startIndexNew = this.state.startIndexRow;

		if (Math.abs(stepIncrementRaw) > this.props.itemHeight) {   // moved too high  (end of virtual buffer)
			startIndexNew =  startIndexNew + Math.floor(stepIncrementRaw/this.props.itemHeight);
			stepIncrement = stepIncrementRaw % this.props.itemHeight;
		}
		//Stop rendering if you hit border, in case server does not return anything do not render
		var tt = this.state.offset - stepIncrement; // negative addition: moving higher

		if(tt <= -this.getMaxOffset()) {
			startIndexNew =  startIndexNew + 1;
			//console.log('down additioanl offset ' + (tt + this.getMaxOffset()));
		 	tt =  this.initialOffset + (tt + this.getMaxOffset() );
		}
		this.setState({
			offset : tt,
			startIndexRow: startIndexNew
		},  this.chainPromisesRow());
	}

	getUp(stepIncrementRaw) {
		let stepIncrement = stepIncrementRaw;
		let startIndexNew = this.state.startIndexRow;
		if (Math.abs(stepIncrementRaw) > this.props.itemHeight) {// hit margin going down
			startIndexNew =  startIndexNew - Math.floor(-stepIncrementRaw/this.props.itemHeight);
			stepIncrement = stepIncrementRaw % this.props.itemHeight;
		};
		var tt = this.state.offset - stepIncrement;   // step is already negative, need to push down
		//Go up if pixel  greater than 0
		if(tt >= 0) {
			//console.log('additioanl offset ' + tt);
			tt = this.initialOffset + tt;
			startIndexNew =  startIndexNew - 1;
		};
		this.setState({
				offset : tt,
				startIndexRow : startIndexNew
		}, this.chainPromisesRow());
	}

	hitMax(){
		this.loadMore();
	}

	handleChangePosition(movement, orientation) {
		let virtualHeight=(this.getRangeElements())  * this.props.itemHeight;
		if (movement >=0 && movement <= virtualHeight ) {
			let newMove = movement - this.state.vMovement;
			//console.log(" movement " + movement + "," + newMove);
			if (newMove > 0) {
				this.getDown(newMove)
			} else {
				this.getUp(newMove)
			}
			this.setState({vMovement: movement});
		}
	}

	componentDidMount() {
		this.chainPromisesRow();
		//	this.fetchInitalData();
		this.calculateSize()

		// Attach The Event for Responsive View~
		window.addEventListener('resize', this.calculateSize.bind(this))
	}

	componentWillUnmount(){
		// Remove Event
		window.removeEventListener('resize', this.calculateSize.bind(this))
	}

	handleScrollbarDragging(e){
		//console.log("dragging " + e)
	}

	handleScrollbarStopDrag(e){
		//console.log("stop drag " + e)
	}

	getSize(){
	    // The Elements
	    let $scrollArea = this.refs.scrollArea
	    let $scrollWrapper = this.refs.scrollWrapper
	    // Get new Elements Size
	    let elementSize = {
	      // Scroll Area Height and Width
	      scrollAreaHeight: this.getRangeElements() * this.props.itemHeight,

	      // Scroll Wrapper Height and Width
	      scrollWrapperHeight: this.numberOfDiv * this.props.itemHeight
	    }

	    return elementSize
  	}

  	calculateSize(cb){
	    let elementSize = this.getSize()
	    if( elementSize.scrollWrapperHeight != this.state.scrollWrapperHeight ||
	        elementSize.scrollAreaHeight != this.state.scrollAreaHeight )
	    {
	      // Set the State!
	      this.setState(elementSize);
	    }
  	}

	chainPromisesRow() {
		var sIndex = this.state.startIndexRow;
		_.range(sIndex, sIndex + this.numberofItemsTobeLoadedInAdvance).map((x) => {
			let itemIndexList = this.getItemIndexes(x);
			for(var itemIndex = 0; itemIndex <= itemIndexList.length; itemIndex++) {
				let handlerFunc =  ((id) => {
					return (result) => {
					var temp = this.state.lrucache;
					temp.put(id,result);
					//console.log(result);
					this.setState({lrucache: temp});
					}
				}) (itemIndexList[itemIndex]);
				this.getPromiseWrapper(itemIndexList[itemIndex], handlerFunc);
			}
		})
	}

	loadMore() {
		let endElement = this.state.startIndexRow + this.numberofItemsTobeLoadedInAdvance;//incrememnting number of loaded elelemnts
		if (endElement > this.state.maxLoadedElements) {
			this.setState({
				maxLoadedElements : endElement
				})
		}
	}
	getPromiseWrapper(index, handler){
		if(this.state.lrucache.get(index) === null) {
			return; //do nothing; promise already kicked off
		}
		if(this.state.lrucache.get(index) !== undefined) {
			return  this.state.lrucache.get(index);
		} else {
			this.state.lrucache.put(index, null);
			(this.props.getPromise(index)).then(handler)
		}
	}

	getItemIndexes(rowIndex){
		let  itemIndexes = [];
		let end =  this.numberofColumns * (rowIndex +1);
		let start = end - this.numberofColumns;
		for (var i = start; i < end; i++){
			itemIndexes.push(i);
		}
		return itemIndexes;
	}

	getItemsForRow(rowIndex) {
		let  listShow = [];
		//if(rowIndex < 0) return ;
		var itemStyle ={
            	position:"relative",
            	height : this.props.itemHeight,
            	width: this.props.itemWidth,
            	flexGrow:0,
            	flexShrink:0,
        }
		let listIndexes = this.getItemIndexes(rowIndex);
		for (var i=0; i<listIndexes.length; i++) {
			if(this.state.lrucache.get(listIndexes[i])) {
					listShow.push(
						// <ReactCSSTransitionGroup transitionName="example" transitionAppear={true}  
						// transitionAppearTimeout={100}
						// transitionEnterTimeout={10}
						// transitionLeaveTimeout={10}
						// >
						<div style={itemStyle} key={listIndexes[i]}>{this.state.lrucache.get(listIndexes[i])}</div>
						//</ReactCSSTransitionGroup>
						);
				} else {
					listShow.push(<div key={listIndexes[i]} style={itemStyle}><div className="loader"></div></div>);
					//listShow.push(<div key={listIndexes[i]} style={itemStyle}><h2>Loading...</h2></div>);
				}

		}
		return listShow;
	}
	render(){

	  var styleName = {
             width : this.props.width,
             height : this.props.height,
             border : '1px solid black',
             backgroundColor :'#f3f3f3',
             overflow:'hidden',
            };
            var contentStyle = {
            	position:"relative",
            	marginTop: this.state.offset  ,
            }
            var parentStyle= {
            	display:'flex',
            	height:this.props.itemHeight,
            }

	    return (
			<div >
			<div style={parentStyle}>
			<div id="viewPort" style={styleName} ref="scrollWrapper">
			<div id="content" ref="scrollArea" style={contentStyle} >
			{
				_.range(this.state.startIndexRow  -1  , this.state.startIndexRow + this.numberOfDiv + this.numBufferExtraElements)
					.map((x) => {
						return(<div style={parentStyle} key={x}>
							{this.getItemsForRow(x)}
						</div>)
				})
			}
			</div>
			</div>
				<VerticalScrollbar
				      height={this.props.height}
				      maxRange={this.maxRange}
				      virtualHeight={this.state.maxLoadedElements * this.props.itemHeight}
			              area={{ height: this.state.maxLoadedElements * this.props.itemHeight}}
			              wrapper={{ height: this.numberOfDiv * this.props.itemHeight}}
			              scrolling={ this.state.vMovement }  //int
			              draggingFromParent={ true }// boolean
			              onChangePosition={ this.handleChangePosition.bind(this) }
			              onDragging={ this.handleScrollbarDragging.bind(this) }
			              onStopDrag={ this.handleScrollbarStopDrag.bind(this) }
			              onHitMax ={this.hitMax.bind(this)}
				/>
			</div>
			</div>
		);
	}
}

VirtualGrid.defaultProps = {
  speed: 53,
  className: ""
}

VirtualGrid.propTypes = {
	width : React.PropTypes.number.isRequired,
	height : React.PropTypes.number.isRequired,
	itemWidth : React.PropTypes.number.isRequired,
	itemHeight : React.PropTypes.number.isRequired,
	getPromise : React.PropTypes.func.isRequired
}

/**
 *
 */
