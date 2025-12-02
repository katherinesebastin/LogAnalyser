import React, { useEffect, useState } from "react";
import axios from "axios";
import EventChart from "./EventChart";

export default function Dashboard(){
  const [events, setEvents] = useState({
  "Boot Logs": 12,
  "System Updates": 8,
  "Failed Logins": 3,
  "Crash Reports": 2,
  "Kernel Errors": 1
  });
  const [loading, setLoading] = useState(false);

  /* useEffect(() => {
    async function fetchData(){
      try {
        const res = await axios.get("/api/log_data");
        setEvents(res.data);
      } catch (err) {
        console.error("Error fetching log data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []); */ 

  const eventKeys = Object.keys(events);
  const totalEventTypes = eventKeys.length;
  const totalErrors =
    (events["Failed Logins"] || 0) +
    (events["Kernel Errors"] || 0) +
    (events["Crash Logs"] || 0);

  const handleDownload = (type) => {
    // simple browser redirect to Flask download route
    window.location.href = `/download/${type}`;
  };

  return (
    <div className="container py-5" style={{backgroundColor: "#F4F6F8", minHeight: "100vh"}}>
      <div className="text-center mb-4">
        <h1 style={{color: "#2C3E50"}}>📊 Log Analyzer Dashboard</h1>
        <p className="text-muted">Visualize system events and download reports</p>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-3" style={{borderRadius: 12}}>
            <div className="card-header" style={{ backgroundColor: "#2C3E50", color: "#fff" }}>Event Chart</div>
            <div className="card-body">
              {loading ? <p>Loading chart…</p> : <EventChart events={events} />}
            </div>
          </div>

          <div className="card mb-3" style={{borderRadius: 12}}>
            <div className="card-header" style={{ backgroundColor: "#2C3E50", color: "#fff" }}>Event Details</div>
            <div className="card-body">
              <ul className="list-group">
                {eventKeys.map((k) => (
                  <li key={k} className="list-group-item d-flex justify-content-between align-items-center">
                    {k}
                    <span className="badge rounded-pill" style={{ backgroundColor: "#3498DB", color: "#fff" }}>{events[k]}</span>
                  </li>
                ))}
                {eventKeys.length === 0 && <li className="list-group-item">No events found</li>}
              </ul>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card mb-3" style={{borderRadius: 12}}>
            <div className="card-header" style={{ backgroundColor: "#2C3E50", color: "#fff" }}>Summary</div>
            <div className="card-body">
              <p>Total event types: <strong>{totalEventTypes}</strong></p>
              <p>Total errors/failures: <strong style={{color: "#c0392b"}}>{totalErrors}</strong></p>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary" onClick={() => handleDownload("csv")}>Download CSV</button>
                <button className="btn btn-outline-secondary" onClick={() => handleDownload("txt")}>Download TXT</button>
              </div>
            </div>
          </div>

          <div className="card mb-3" style={{borderRadius: 12}}>
            <div className="card-header" style={{ backgroundColor: "#2C3E50", color: "#fff" }}>Upload Log File</div>
            <div className="card-body">
              <form action="/" method="POST" encType="multipart/form-data">
                <div className="mb-3">
                  <input className="form-control" type="file" name="logfile" />
                </div>
                <button className="btn btn-success" type="submit">Upload</button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
