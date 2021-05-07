import axios from "axios";
import { useState } from "react";
import "./styles.css";

export default function App() {
  const [sessions, setSessions] = useState([]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const result = e.target.form;
    getSessionsFromApi({
      age: result[0].value,
      date: getDateFormat(result[2].value),
      pincode: result[1].value
    });
  };

  const getSessionsFromApi = async ({ age, date, pincode }) => {
    const response = await axios.get(
      `${process.env.REACT_APP_RESOURCE_URL}?pincode=${pincode}&date=${date}`
    );
    setSessions(getConvertedResponse({ centers: response.data.centers, age }));
  };

  return (
    <div className="text--center">
      <form>
        <div className="input__box">
          <input
            className="input"
            type="tel"
            placeholder="Enter Age"
            maxLength="2"
            required
          />
        </div>
        <div className="input__box">
          <input
            className="input"
            type="tel"
            placeholder="Enter Pincode"
            maxLength="6"
            required
          />
        </div>
        <div className="input__box">
          <input
            className="input"
            type="date"
            placeholder="Enter Date"
            required
          />
        </div>
        <button
          type="submit"
          onClick={handleFormSubmit}
          className="button button--primary subtitle--sm button--sm"
          style={{ color: "white" }}
        >
          Search
        </button>
      </form>
      {sessions.length === 0 ? (
        <div> No centers available</div>
      ) : (
        <ShowCenters sessions={sessions} />
      )}
    </div>
  );
}

const ShowCenters = ({ sessions }) => {
  return (
    <>
      <div className="grid--row">
        <div> Center Name</div>
        <div> Available Capacity </div>
        <div> Age Limit </div>
      </div>
      {sessions.map(
        ({ session_id, name, min_age_limit, available_capacity }) => (
          <div key={session_id} className="grid--row">
            <div>{name}</div>
            <div>{available_capacity}</div>
            <div>{min_age_limit}</div>
          </div>
        )
      )}
    </>
  );
};

const getAvailableSession = ({ currentCenter, age }) => {
  return currentCenter.sessions.find(
    ({ min_age_limit }) => min_age_limit === Number(age)
  );
};

const getConvertedResponse = ({ centers, age }) => {
  return centers.reduce((finalResponse, currentCenter) => {
    const availableSession = getAvailableSession({
      currentCenter,
      age
    });
    if (availableSession) {
      return finalResponse.concat({
        ...availableSession,
        ...currentCenter
      });
    }
    return finalResponse;
  }, []);
};

const getDateFormat = (date) => {
  return date.split("-").reverse().join("-");
};
