
import React from 'react';

class VerticalScrollbar extends React.Component {
	static propTypes() {
		//height: React.PropTypes.number.isRequired,
		//scrolling: React.PropTypes.number.isRequired
	}

  constructor() {
    super();
    this.state = {
      height: 0,
      dragging: false,
      start: 0
    }
  }

  render(){
    return(
      <div
        className="react-scrollbar__scrollbar-vertical"
        ref="container"
        onClick={ this.jump.bind(this) }
          style={{
            height: this.props.height+'px'
          }}>
        <div
          className={ "scrollbar" + ( this.state.dragging || this.props.draggingFromParent ? '' : ' react-scrollbar-transition') }
          ref="scrollbar"
          onTouchStart={ this.startDrag.bind(this) }
          onMouseDown={ this.startDrag.bind(this) }
          style={{
            height: this.state.height+'%',
            top: (this.props.scrolling/this.state.scaleRatio)  + 'px'
          }} />

      </div>
    )
  }


  startDrag(e){

    e.preventDefault()
    e.stopPropagation()

    e = e.changedTouches ? e.changedTouches[0] : e

    // Prepare to drag
    this.setState({
      dragging: true,
      start: e.clientY
    })
  }

  onDrag(e){

    if(this.state.dragging){

      // Make The Parent being in the Dragging State
      this.props.onDragging()

      e.preventDefault()
      e.stopPropagation()

      e = e.changedTouches ? e.changedTouches[0] : e

      let yMovement = e.clientY - this.state.start
      //let yMovementPercentage = yMovement / this.props.wrapper.height * 100

      // Update the last e.clientY
      this.setState({ start: e.clientY }, () => {

        // The next Vertical Value will be
        let next = this.props.scrolling + (yMovement * this.state.scaleRatio);
        //console.log(next);
        //check beoundary conditions 
        if (next <= 0) {
          next = 0;
        } else if (next >= this.props.virtualHeight ) {
          next = virtualHeight;
        }
        //hits maximum  of the virtual height
        if (next >= this.props.virtualHeight - ((this.state.height/100)* this.props.virtualHeight)) {
          this.props.onHitMax();
        }

        // Tell the parent to change the position
        this.props.onChangePosition(next, 'vertical');
      })



    }

  }

  stopDrag(e){
    if(this.state.dragging){
      // Parent Should Change the Dragging State
      this.props.onStopDrag()
      this.setState({ dragging: false })
    }
  }

  jump(e){

    let isContainer = e.target === this.refs.container

    if(isContainer){

      // Get the Element Position
      let position = this.refs.scrollbar.getBoundingClientRect()

      // Calculate the vertical Movement
      let yMovement = e.clientY - position.top
      let centerize = (this.state.height / 2)
      let yMovementPercentage = yMovement - centerize

      // Update the last e.clientY
      this.setState({ start: e.clientY }, () => {

        // The next Vertical Value will be
        let next = this.props.scrolling + yMovement

        // Tell the parent to change the position
        this.props.onChangePosition(next, 'vertical')

      })

    }
  }

  calculateSize(source){
    // Scrollbar Height // HACK if you want to increase height
    console.log(source.area.height);
    console.log(this.refs.container.clientHeight);
    this.setState({ 
		height: (source.wrapper.height/source.area.height) * 100,
		scaleRatio: parseFloat(source.area.height/this.refs.container.clientHeight).toPrecision(3)
	});
  }

  componentWillReceiveProps(nextProps) {
    if( nextProps.wrapper.height !== this.props.wrapper.height ||
        nextProps.maxRange !== this.props.maxRange ||
        nextProps.area.height !== this.props.area.height) this.calculateSize(nextProps)
  }

  componentDidMount() {
    this.calculateSize(this.props)

    // Put the Listener
    document.addEventListener("mousemove", this.onDrag.bind(this))
    document.addEventListener("touchmove", this.onDrag.bind(this))
    document.addEventListener("mouseup", this.stopDrag.bind(this))
    document.addEventListener("touchend", this.stopDrag.bind(this))
  }

  componentWillUnmount() {
    // Remove the Listener
    document.removeEventListener("mousemove", this.onDrag.bind(this))
    document.removeEventListener("touchmove", this.onDrag.bind(this))
    document.removeEventListener("mouseup", this.stopDrag.bind(this))
    document.removeEventListener("touchend", this.stopDrag.bind(this))
  }

}

export default VerticalScrollbar;
