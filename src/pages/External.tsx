import { useLocation } from 'react-router-dom';
import { Box, Card, CardContent } from '@mui/material';
import WebviewComponent from '../components/Webview';
import '../styles/requirement.scss';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setHeaderTooltip, setPageTitle } from '@/redux/slices/appSlice';

const ExternalPage = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const params = new URLSearchParams(location.search);

  // Retrieve query parameters
  const header = params.get('header') || "Default Name";
  const link = params.get('link') || "https://default.url.com";

  useEffect(() => {
    dispatch(setPageTitle(header));
    dispatch(setHeaderTooltip('Please ensure that you review the VAW and GenAI usage policies, terms, and conditions on the community; https://glo.globallogic.com/communities/843'));
  },[header]);

  return (
    <Box
      className='pageWrapper'
    >
      <Card
        className='pageCard'
        style={{height:"700px", overflowY:"scroll"}}
      >
          <CardContent>
            <Box>
              <WebviewComponent
                  headerText={header}
                  url={link}
              />
            </Box>
            </CardContent>
      </Card>
    </Box>
  );
};

export default ExternalPage;
