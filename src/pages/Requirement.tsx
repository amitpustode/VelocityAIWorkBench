import { Box, Card, CardContent } from '@mui/material';
import WebviewComponent from '../components/Webview';
import '../styles/requirement.scss';

const RequirementPage = () => {

  return (
    <Box
      className='pageWrapper'
    >
      <Card
        className='pageCard'
      >
          <CardContent>
            <Box>
              <WebviewComponent
                  headerText="GenAI Assistance in Generating Business Requirements"
                  url="https://script.google.com/a/macros/globallogic.com/s/AKfycbzZrS6_HcChZDwf1qlMRXSc3LVGqzByo4G4GqGBidosh4QHVrRCebcZ2aQh29jwfn4Nqw/exec"
              />
            </Box>
            </CardContent>
      </Card>
    </Box>
  );
};

export default RequirementPage;
