import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import React, { useState, useEffect, useRef } from 'react';
import { FcNext, FcPrevious } from "react-icons/fc";
import { Navigation } from 'swiper/modules';
import axios from 'axios';
import '../styles/Main.css';

const CreateAndMaintainAnalytics = () => {
  const [activeTopic, setActiveTopic] = useState('');
  const [activeSubtopic, setActiveSubtopic] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const [topicsData, setTopicsData] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [updatedScore, setUpdatedScore] = useState(null);  
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [message, setMessage] = useState('');
  const swiperRef = useRef(null);

  useEffect(() => {
    axios.get('http://localhost:5000/data')
      .then(response => {
        // Filter for topic_id: 3
        const filteredData = response.data.filter(topic => topic.topic_id === 3);
        setTopicsData(filteredData);

        if (filteredData.length > 0) {
          setActiveTopic(filteredData[0].topic_name);
          setActiveSubtopic(Object.values(filteredData[0].subtopics)[0]?.subtopic_name || '');
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const handleButtonClick = (subtopic) => {
    const topic = topicsData.find((topic) => topic.topic_name === activeTopic);
    const tabIndex = Object.values(topic.subtopics).findIndex(
      (st) => st.subtopic_name === subtopic
    );
  
    setActiveSubtopic(subtopic);
    setTabIndex(tabIndex);
  
    // Sync Swiper slide
    if (swiperRef.current) {
      swiperRef.current.slideToLoop(tabIndex); // Use slideToLoop for loop mode
    }
  };
  

  const handleOptionClick = (questionId, optionId) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const calculateAndDisplayResults = () => {
    let totalScore = 0;
    let attemptedQuestions = 0;
    let averageScore = 0;

    topicsData.forEach((topic) => {
      Object.values(topic.subtopics).forEach((subtopic) => {
        subtopic.questions.forEach((question) => {
          const selectedOption = selectedOptions[question.question_id];
          if (selectedOption) {
            totalScore += parseInt(selectedOption);
            attemptedQuestions += 1;
          }
        });
      });
    });

    if (attemptedQuestions > 0) {
      averageScore = totalScore / attemptedQuestions;
    }

    let resultMessage = '';
    if (averageScore >= 1 && averageScore <= 1.5) {
      resultMessage = 'Unaware: Score: 1-1.5';
    } else if (averageScore > 1.5 && averageScore <= 2.5) {
      resultMessage = 'Aware: Score: 1.6-2.5';
    } else if (averageScore > 2.5 && averageScore <= 3.5) {
      resultMessage = 'Reactive: Score: 2.6-3.5';
    } else if (averageScore > 3.5 && averageScore <= 4.5) {
      resultMessage = 'Proactive: Score: 3.6-4.5';
    } else if (averageScore > 4.5 && averageScore <= 5.5) {
      resultMessage = 'Managed: Score: 4.6-5.5';
    } else if (averageScore > 5.5 && averageScore <= 6) {
      resultMessage = 'Effective: Score: 5.6-6';
    }

    

    // Save the results to the database
    saveResultsToDatabase(totalScore, attemptedQuestions, averageScore);
  };

  const saveResultsToDatabase = (totalScore, attemptedQuestions, averageScore) => {
    const token = localStorage.getItem("token"); 
    if (!token) {
        console.error("No token found. User is not authenticated.");
        return;
    }

    try {
        
        const payload = JSON.parse(atob(token.split(".")[1])); 
        const userId = payload.userId; 

        topicsData.forEach((topic) => {
            Object.values(topic.subtopics).forEach((subtopic) => {
                subtopic.questions.forEach((question) => {
                    const selectedOptionId = selectedOptions[question.question_id];

                    if (selectedOptionId) {
                        axios
                            .post(
                                "http://localhost:5000/save-result",
                                {
                                    user_id: userId,
                                    question_id: question.question_id,
                                    selected_option_id: selectedOptionId,
                                    score: totalScore, 
                                },
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`, 
                                    },
                                }
                            )
                            .then((response) => {
                                console.log("Results saved:", response.data);
                            })
                            .catch((error) => {
                                console.error("Error saving results:", error);
                            });
                    }
                });
            });
        });

        
        fetchAndDisplayUpdatedScore(userId, token);
    } catch (error) {
        console.error("Failed to decode token:", error);
    }
};

const fetchAndDisplayUpdatedScore = (userId, token) => {
    axios
        .get(`http://localhost:5000/get-user-score/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`, 
            },
        })
        .then((response) => {
            console.log("Updated Score:", response.data);
            setUpdatedScore(response.data.totalScore); 
        })
        .catch((error) => {
            console.error("Error fetching updated score:", error);
        });
}; 

useEffect(() => {
  updateProgress(); 
}, [selectedOptions]);

const updateProgress = () => {
  let totalQuestions = 0;
  let answeredQuestions = 0;

  topicsData.forEach((topic) => {
    Object.values(topic.subtopics).forEach((subtopic) => {
      subtopic.questions.forEach((question) => {
        totalQuestions += 1;
        if (selectedOptions[question.question_id]) {
          answeredQuestions += 1;
        }
      });
    });
  });

  const percentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  setProgressPercentage(Math.round(percentage));
};

useEffect(() => {
  if (progressPercentage >= 25 && progressPercentage < 50) {
    setMessage("Great Job! You're making progress!");
  } else if (progressPercentage >= 50 && progressPercentage < 75) {
    setMessage("Keep it up! You're almost halfway there!");
  } else if (progressPercentage >= 75 && progressPercentage < 100) {
    setMessage("You're almost there! Finish strong!");
  } else if (progressPercentage === 100) {
    setMessage("Congrats! You've completed the task!");
  } else {
    setMessage('');
  }
}, [progressPercentage]);




  return (
    <div>
      <h2>{activeTopic}</h2>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-10px' }}>
        <a href="/login" style={{ marginRight: '10px', textDecoration: 'none', color: 'blue' }}>Login</a>
        <a href="/register" style={{ textDecoration: 'none', color: 'blue' }}>Register</a>
      </div>

      <button onClick={calculateAndDisplayResults}>Submit</button>

      <div style={{
  position: 'absolute',
  top: '35px',
  right: '10px',
  display: 'flex',
  alignItems: 'center',  
  gap: '20px',           
}}>
  <div style={{ width: '50px', height: '50px' }}>
    <CircularProgressbar
      value={progressPercentage}
      text={`${progressPercentage}%`}
      styles={buildStyles({
        textColor: '#000',
        pathColor: 'gold',
        textSize: '30px', 
        textWeight: '10000',
      })}
    />
  </div>

  {message && (
    <div style={{
      fontSize: '16px',
      color: '#333',
      fontWeight: 'bold',
      width: '150px',  
    }}>
      {message}
    </div>
  )}
</div>



      <div className="button-container">
        {topicsData.length > 0 && Object.values(topicsData.find(topic => topic.topic_name === activeTopic).subtopics).map((subtopic, index) => (
          <button
            key={index}
            onClick={() => handleButtonClick(subtopic.subtopic_name)}
            className={activeSubtopic === subtopic.subtopic_name ? 'active' : ''}
          >
            {activeSubtopic === subtopic.subtopic_name ? (
              <img
                src="https://static.vecteezy.com/system/resources/thumbnails/022/109/097/small/full-moon-free-png.png"
                alt="Moon Icon"
                className="moon-icon"
              />
            ) : (
              <img
                src="https://static.vecteezy.com/system/resources/thumbnails/011/421/315/small/green-glossy-ball-png.png"
                alt="Inactive Circle Icon"
                className="inactive-icon"
              />
            )}
            {subtopic.subtopic_name}
          </button>
        ))}
      </div>

      {topicsData.length > 0 && (
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          navigation={{
            nextEl: '.next-button',
            prevEl: '.prev-button',
          }}
          onSlideChange={(swiper) => {
            const realIndex = swiper.realIndex;
            const topic = topicsData.find((topic) => topic.topic_name === activeTopic);
            const currentSubtopic = Object.values(topic.subtopics)[realIndex];
            if (currentSubtopic) {
              setTabIndex(realIndex);
              setActiveSubtopic(currentSubtopic.subtopic_name);
            }
          }}
          
          modules={[Navigation]}
          className="swiper-container"
          initialSlide={tabIndex}
          loop
        >
          {Object.values(topicsData.find(topic => topic.topic_name === activeTopic).subtopics).map((subtopic, index) => (
            <SwiperSlide key={index}>
              <div className="questions">
                {subtopic.questions && subtopic.questions.map((question) => (
                  <div key={question.question_id} className="question-container">
                    <p>{question.question_text}</p>
                    <div className="options">
                      {question.options && question.options.map((option) => (
                        <button
                          key={option.option_id}
                          onClick={() => handleOptionClick(question.question_id, option.option_id)}
                          className={`option-button ${selectedOptions[question.question_id] === option.option_id ? 'selected' : ''}`}
                        >
                          {option.option_text}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      <div className="carousel-buttons">
        <button className="prev-button">
          <FcPrevious />
        </button>
        <button className="next-button">
          <FcNext />
        </button>
      </div>

      {updatedScore !== null && (
        <div>
          <h3>Updated Score: {updatedScore}</h3>
        </div>
      )}
    </div>
  );
};

export default CreateAndMaintainAnalytics;