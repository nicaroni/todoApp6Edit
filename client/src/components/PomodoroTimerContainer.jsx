import React, {useEffect, useState} from "react";
import axios from "axios";
import API_URL from '../config';
import '../assets/styles/todoMain.scss';


const PomodoroTimer = ({ theme, isRunning, setIsRunning, todoId, refreshTodos }) => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [timeSpent, setTimeSpent] = useState(0);
    const [refresh, setRefresh] = useState(false);



    useEffect(() => {
      let timer;
      if (isRunning) {
        timer = setInterval(() => {
          setTimeLeft((prevTime) => {
            if (prevTime <= 1) {
              clearInterval(timer);
              setIsRunning(false);
              console.log("Pomodoro session completed! 🎉");
    
              // ✅ Update time spent in the database
              handlePomodoroEnd(); 
              return 0; // Reset timer to zero
            }
            return prevTime - 1;
          });
          setElapsedTime(prev => prev + 1); // Track elapsed time in seconds
        }, 1000);
      } else {
        clearInterval(timer);
      }
      return () => clearInterval(timer);
    }, [isRunning]);

    useEffect(() => {
      console.log("Time spent updated:", timeSpent);
  }, [timeSpent]); // ✅ This ensures UI updates when `timeSpent` changes
  

    const handleEndPomodoro = async () => {
      setTimeSpent(prev => prev + 1); // ✅ Ensure state updates
      setRefresh(prev => !prev); // ✅ Force re-render
      if (!todoId) {
        console.error("Error: todoId is missing!");
        return; // Prevent request if there's no valid todoId
    }
      const minutesSpent = Math.floor(elapsedTime / 60); // Convert seconds to minutes

      if (minutesSpent > 0) {
        try {
          const response = await axios.put(
            `${API_URL}/todos/${todoId}/time`,
            { minutes: minutesSpent },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );
          console.log(`✅ Added ${minutesSpent} minutes to todo ${todoId}`);
          refreshTodos(todoId, response.data.updatedTodo.time_spent);
        } catch (err) {
          console.error("❌ Error updating time:", err);
        }
      }
    
      // Reset Timer
      setTimeLeft(25 * 60);
      setElapsedTime(0);
      setIsRunning(false);
    };


    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
    };
    


      return (
        <div className={`pomodoro-container ${theme}`}>  
        {/* ✅ Ensure `theme` is applied */}
        
<h2>
  POMODORO
  <span>POMODORO</span>
  <span>POMODORO</span>
  <span>track your progress</span>
</h2>
        <div className="pomodoro-style">
          <div className="pomodoro-circle1">
            <div className="pomodoro-circle2">
              <div className="pomodoro-circle3 timing">
              <div className="pomodoro-circle4">
              <div className="pomodoro-circle5">
                <div className="pomodoro-content">
                  <div className="clock"><div className="timer">{formatTime(timeLeft)}</div>

                  </div>
                  </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
        
        <div className="controls">
          <button className="button-30" onClick={() => setIsRunning(true)}>Start</button>
          <button className="button-30" onClick={() => setIsRunning(false)}>Pause</button>
          <button className="button-30" onClick={handleEndPomodoro}>End</button> {/* ⏳ END Button */}
          <button className="button-30" onClick={() => setTime(25 * 60)}>Reset</button>
        </div>
      </div>
      );

}

export default PomodoroTimer;