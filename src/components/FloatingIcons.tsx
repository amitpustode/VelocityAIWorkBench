import "../styles/FoatingIcons.scss"; // Optional: Use CSS for styling
import { Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import NewspaperIcon from '@mui/icons-material/Newspaper';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';

const FloatingIcons = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* <button
        onClick={toggleVisibility}
        style={{
          position: "fixed",
          right: "20px",
          bottom: isVisible ? "120px" : "20px",
          zIndex: 1000,
        }}
      >
        {isVisible ? "Hide" : "Show"}
      </button> */}

      
        <div style={{ position: "fixed", right: "20px", bottom: "100px", zIndex: 999 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Tooltip title="Case Studies" placement="left" arrow>
                <button
                onClick={() => navigate('casestudy')}
                className="floatingbutton newsicon"
                >
                <EmojiEventsOutlinedIcon />
                </button>
            </Tooltip>
            <Tooltip title="News" placement="left" arrow>
                <button
                onClick={() => navigate('news')}
                className="floatingbutton newsicon"
                >
                <NewspaperIcon />
                </button>
            </Tooltip>
            <Tooltip title="Help" placement="left" arrow>
                <button 
                onClick={() => navigate('help')}
                className="floatingbutton helpicon">
                <QuestionMarkIcon />
                </button>
            </Tooltip>
          </div>
        </div>
      
    </div>
  );
};

export default FloatingIcons;
