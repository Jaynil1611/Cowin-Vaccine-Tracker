import axios from "axios";
import { useState } from "react";
import "./styles.css";

const district_id = 395;

export default function App() {
  const [sessions, setSessions] = useState([]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const [age, pincode, vaccine, date] = e.target.form;
    if (age.value && date.value && vaccine.value) {
      return getSessionsFromApi({
        age: age.value,
        date: getDateFormat(date.value),
        pincode: pincode.value,
        vaccine: vaccine.value,
      });
    }
    alert("Please fill all fields");
  };

  const getSessionsFromApi = async ({ age, date, pincode, vaccine }) => {
    const response = pincode
      ? await axios.get(
          `${process.env.REACT_APP_RESOURCE_URL}/calendarByPin?pincode=${pincode}&date=${date}`
        )
      : await getAllSessionsFromApi({ age, date });
    setSessions(
      getConvertedResponse({ centers: response.data.centers, age, vaccine })
    );
  };

  const getAllSessionsFromApi = async ({ age, date }) => {
    return await axios.get(
      `${process.env.REACT_APP_RESOURCE_URL}/calendarByDistrict?district_id=${district_id}&date=${date}`
    );
  };

  return (
    <div className="text--center">
      <form>
        <div className="input__box">
          <select
            required
            className="input"
            name="age-group"
            defaultValue="Select Age Group"
          >
            <option value="Select Age Group" disabled hidden>
              Select Age Group
            </option>
            <option value="18">18-44</option>
            <option value="45">45+</option>
          </select>
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
          <select
            required
            className="input"
            name="vaccine"
            defaultValue="Select Vaccine"
          >
            <option value="Select Vaccine" disabled hidden>
              Select Vaccine
            </option>
            <option value="COVISHIELD">COVISHIELD</option>
            <option value="COVAXIN">COVAXIN</option>
          </select>
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
        <div className="spacing"> No centers available</div>
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
        <div> Address </div>
        <div> Available Capacity</div>
        <div> Age Limit </div>
        <div> Fee Type </div>
      </div>
      {sessions.map(
        ({
          session_id,
          name,
          min_age_limit,
          available_capacity,
          address,
          fee_type,
        }) => (
          <div key={session_id} className="grid--row">
            <div>{name}</div>
            <div>{address}</div>
            <div>{available_capacity}</div>
            <div>{min_age_limit}</div>
            <div>{fee_type}</div>
          </div>
        )
      )}
    </>
  );
};

const getAvailableSession = ({
  currentCenter,
  age,
  vaccine: vaccineChoice,
}) => {
  return currentCenter.sessions.find(
    ({ min_age_limit, vaccine }) =>
      min_age_limit === Number(age) && vaccine === vaccineChoice
  );
};

const getConvertedResponse = ({ centers, age, vaccine }) => {
  return centers
    .reduce((finalResponse, currentCenter) => {
      const availableSession = getAvailableSession({
        currentCenter,
        age,
        vaccine,
      });
      if (availableSession) {
        return finalResponse.concat({
          ...availableSession,
          ...currentCenter,
        });
      }
      return finalResponse;
    }, [])
    .sort((a, b) => b.available_capacity - a.available_capacity);
};

const getDateFormat = (date) => {
  return date.split("-").reverse().join("-");
};
