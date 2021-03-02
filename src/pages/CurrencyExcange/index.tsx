import React, {useState} from "react";
import {RouteComponentProps, withRouter} from "react-router";
import {observer} from "mobx-react";
import LayoutUser from "../../components/LayoutUser";

import styled from 'styled-components';
import ExchangeRateStore from "../../stores/ExchangeRateStore";
import ExchangeRateWebsocketService from "../../stores/ExchangeRateWebsocketService";


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
    }
    & .card .title {
      margin-bottom: 10px;
    }
    
    & .card .control-container {
      margin-right: 10px;;
    }
  `;


interface IProps extends RouteComponentProps {

}
const CurrencyExchange: React.FC<IProps> = (props) => {

  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [targetCurrency, setTargetCurrency] = useState('');
  const [convertedValue, setConvertedValue] = useState('');

  const [listExchangeRate, setListExchangeRate] = useState(null);
  const [mapExchangeRate, setMapExchangeRate] = useState(null);

  const [websocketConnected, setWebsocketConnected] = useState(false);


  React.useEffect(() => {
    if(!listExchangeRate) {
      ExchangeRateStore.requestExchangeRate().then((res) => {
        setListExchangeRate(res);

        const newMapExchangeRate = [];
        res['items'].map((item) => {
          newMapExchangeRate[item['id']] = item;
        });
        setMapExchangeRate(newMapExchangeRate);

        setTargetCurrency('R01235');

        updateConvertedValue(selectedAmount, 'R01235', newMapExchangeRate);
      });
    }
  });

  React.useEffect(()=>{
    if(!websocketConnected) {
      ExchangeRateWebsocketService.startWebsocketConnection().then(() => {
        setWebsocketConnected(true);
      });
    }
  }, [websocketConnected]);


  ExchangeRateWebsocketService.registerMessageCallback(handleOnMessage);
  ExchangeRateWebsocketService.registerOnConnectedCallback(handleOnConnected);


  function handleOnMessage(message): void {
    let json;
    try {
      json = JSON.parse(message.data);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log("This doesn't look like a valid JSON: ", message.data);
      return;
    }
    if (json.type === "update-exchange-rate") {
      setListExchangeRate(json['data']);
    } else {
      // eslint-disable-next-line no-console
      console.log("Hmm..., I've never seen JSON like this: ", json);
    }

    // eslint-disable-next-line no-console
    console.log('got message', message);
  }

  const browserClientId = 1000;

  function handleOnConnected(): void {
    ExchangeRateWebsocketService.send(JSON.stringify({ event: "connected", data: {sender: {id: browserClientId}} }));
  }

  const updateCalculation = (event) => {
    if(!event.currentTarget.value) {
      return;
    }
    setTargetCurrency(event.currentTarget.value);
    updateConvertedValue(selectedAmount, event.currentTarget.value, mapExchangeRate);
  };

  const updateConvertedValue = (selectedAmount, targetCurrency, passedMapExchangeRate) => {
    if(selectedAmount && targetCurrency && passedMapExchangeRate) {
      const newConvertedValue = (selectedAmount / passedMapExchangeRate[targetCurrency]['value']).toFixed(5);
      setConvertedValue(newConvertedValue);
    }
  };



  return (
    <LayoutUser>
      <StyledCard>
        <div className="card">
          <h2>Currency Exchange Service</h2>

          <div className="card-content">
            <div className="control-container">
              <div className="title">Currency</div>
              <div><select>
                <option value="rub">RUB</option>
              </select></div>
            </div>
            <div className="control-container">
              <div className="title">Amount</div>
              <div><input type="number" onChange={(event) => { setSelectedAmount(Number(event.currentTarget.value)); updateConvertedValue(event.currentTarget.value, targetCurrency, mapExchangeRate) }} value={selectedAmount}/></div>
            </div>
            <div className="control-container">
              <div className="title">Target Currency</div>
              <div>
                <select value={targetCurrency} onChange={(event) => { updateCalculation(event); }}>
                  <option value="">Not selected</option>
                  {listExchangeRate && listExchangeRate['items'].map((item) => {
                      return (<option key={item['id']} value={item['id']}>{ item['name'] }</option>)
                    })
                  }
                </select>

              </div>
            </div>

            <div>
              <div className="title">Converted Value</div>
              <div><input type="text" defaultValue={convertedValue} /></div>
            </div>
          </div>

          <div style={{fontSize: 17}}>
            <div style={{marginBottom: 10}}>Note: Currency Rates updated every 5 minutes</div>

            <div>
            Last updated: {listExchangeRate && listExchangeRate['last_updated_at'] && (
                <div>
                  { new Date(listExchangeRate['last_updated_at']).toString() }
                </div>
            )}
            </div>
          </div>
        </div>
      </StyledCard>

    </LayoutUser>
  )
};
export default withRouter(observer(CurrencyExchange));
