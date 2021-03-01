import { RequestState } from "types/RequestState";


class ExchangeRateStore {
  state = RequestState.PENDING;

  requestExchangeRate = (): Promise<any> => {
    this.state = RequestState.LOADING;

    return fetch(`${process.env.REACT_APP_API_HOST}/exchange-rate`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        switch (res.status) {
          case 200:
          case 201:
            return res.json();
          default:
            return res.json().then((errBody) => {
              this.setError();
              return Promise.reject({
                message: errBody.message,
              });
            });
        }
      });
  };

  setError = (): void => {
    this.state = RequestState.ERROR;
  };

}

export default new ExchangeRateStore();
