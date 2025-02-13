import React, {useEffect, useState} from "react";
import axios from "axios";
import API_URL from '../config';
import '../assets/styles/todoMain.scss';


const PomodoroTimer = ({ theme }) => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(()=> {
        let timer; 
        if(isRunning) {
            timer = setInterval(() => {
                setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));

            }, 1000);
        } else {
            clearInterval(timer);
        }
        return () => clearInterval(timer);

    }, [isRunning]);

    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
    };
    


      return (
        <div className={`pomodoro-container ${theme}`}>  
        {/* ✅ Ensure `theme` is applied */}
        <h2>Pomodoro Timer</h2>
        <div className="pomodoro-style">
          <div className="pomodoro-circle1">
            <div className="pomodoro-circle2">
              <div className="pomodoro-circle3 timing">
                <div className="pomodoro-content">
                  <div className="clock"><div className="timer">{formatTime(timeLeft)}</div>

                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
        
        <div className="controls">
          <button onClick={() => setIsRunning(true)}>Start</button>
          <button onClick={() => setIsRunning(false)}>Pause</button>
          <button onClick={() => setTime(25 * 60)}>Reset</button>
        </div>
      </div>
      );

}

export default PomodoroTimer;