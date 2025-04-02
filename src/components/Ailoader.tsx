import '../styles/Ailoader.scss';


const Ailoader = (props:any) => {
    const textobj = props.text;
    return (
      <div
        className="ailoader"
        style={{ width: `${props.width}`, height: `${props.height}` }}
      >
        <span className="loader__inner"></span>
        <span className="loader__inner"></span>
        <span className="loader__inner"></span>
        <span className="loader__inner"></span>
        <span className="loader__inner"></span>
        <div
          className="aitext"
          style={{
            display: "block",
            textAlign: "center",
            paddingLeft: "50px",
            width: `100%`,
            height: `100%`,
          }}
        >
          <h4>{textobj.header}</h4>
                <p style={{fontSize:"0.9em"}}>{textobj.text1}</p>
                <p style={{fontSize:"0.9em"}}>{textobj.text}</p>
            </div>
        </div>
    )
}

export default Ailoader