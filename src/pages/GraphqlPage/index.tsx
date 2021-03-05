import React, {useState} from "react";
import {RouteComponentProps, withRouter} from "react-router";
import {observer} from "mobx-react";
import LayoutUser from "../../components/LayoutUser";

import styled from 'styled-components';
import ExchangeRateStore from "../../stores/ExchangeRateStore";


const StyledCard = styled.div`
    & {
      width: 1000px;
      background: #fff;
      border: 1px solid #a0a096;
      border-radius: 10px;
      box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1), 3px 10px 30px rgba(0, 0, 0, 0.08);
      border: none;
    }
    & .card h2 {
      margin-bottom: 40px;
    }
    & .card {
      padding: 40px 40px 40px;
    }
    & .card input, & .card select {
      padding: 15px 10px;
      font-size: 17px;
      width: 200px;
      box-sizing: border-box;
      border-top: 1px solid transparent;
      border: 1px solid #ced4da;
      border-width: 1px;
      height: auto;
      background-color: #fff;
      background-clip: padding-box;
    }
    & .card input:focus, & .card select:focus {
      color: #212529;
      background-color: #fff;
      border-color: #86b7fe;
      outline: 0;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
      position: relative;
    }
    & .card-content {
      display: flex;
      font-size: 21px;
      justify-content: space-between;
      margin-bottom: 30px;
      position: relative;
    }
    & .card .title {
      margin-bottom: 10px;
    }
    
    & .card .control-container {
      margin-right: 10px;;
    }
    & .card .query {
      margin: 0px;
      width: 405px;
      height: 248px;
      font-size: 19px;
      color: rgb(41, 185, 115);
      background: rgb(15, 32, 45);
      outline: none;
      border: none;
      padding-left: 60px;
      padding-top: 20px;
      resize: none;
    }
    & .card .response {
      margin: 0px;
      width: 405px;
      height: 248px;
      font-size: 19px;
      color: rgb(51, 147, 220);
      background: rgb(23, 43, 58);
      outline: none;
      border: none;
      padding-left: 60px;
      padding-top: 20px;
      resize: none;
    }
    & .card .response.error {
      color: rgb(241, 143, 1);
    }
  `;

const PlayIcon = styled.button`
  & {
    background: url(/play-icon.png);
    width: 100px;
    height: 100px;
    border-radius: 50px;
    background-position-x: 8px;
    border: 1px solid rgb(11, 20, 28);
    position: absolute;
    margin: auto;
    left: 0;
    right: 0;
    top: 10px;
    opacity: 0.9;
    transform: scale(1);
    outline: 0;
    cursor: pointer;
  }
  &:hover, &:focus {
    opacity: 1;
    transform: scale(0.9);
  }
`;


interface IProps extends RouteComponentProps {

}
const GraphqlPage: React.FC<IProps> = (props) => {

  const [selectedQueryValue, setSelectedQueryValue] = useState(null);
  const [selectedResponseValue, setSelectedResponseValue] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const mockQueryValue = "{\n" +
    "  valutes {\n" +
    "    id\n" +
    "    name\n" +
    "    value\n" +
    "    previous\n" +
    "  }\n" +
    "}";

  const sendGraphqlRequest = (queryValue) => {
    setErrorMessage(null);
    ExchangeRateStore.graphqlRequest(queryValue).then((res) => {
      setSelectedResponseValue(JSON.stringify(res,null,2));
    }).catch((error) => {
      setErrorMessage(error['message']);
    })
  };

  React.useEffect(() => {
    if(selectedQueryValue === null) {
      setSelectedQueryValue(mockQueryValue);
      sendGraphqlRequest(mockQueryValue.replace('\n', ''));
    }
  });

  const onSubmit = (event) => {
    event.preventDefault();
    sendGraphqlRequest(selectedQueryValue);

  };

  return (
    <LayoutUser>
      <StyledCard>
        <div className="card">
          <h2>Graphql Request</h2>

          <div className="card-content">
            <div>
              <textarea className="query" onChange={(event) => {setSelectedQueryValue(event.currentTarget.value)}} value={selectedQueryValue} spellCheck="false" />
            </div>
            <div>
              { !errorMessage && (
                <textarea value={selectedResponseValue} className="response" spellCheck="false" />
              )}
              { errorMessage && (
                <textarea value={errorMessage} className="response error" spellCheck="false" />
              )}
            </div>
            <form onSubmit={onSubmit}>
              <PlayIcon />
            </form>

          </div>
        </div>

      </StyledCard>
    </LayoutUser>
  )
};
export default withRouter(observer(GraphqlPage));
