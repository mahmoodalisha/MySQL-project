import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';

import React, { useState, useEffect } from 'react';
import { FcNext, FcPrevious } from "react-icons/fc";
import { Navigation } from 'swiper/modules';
import axios from 'axios';
import '../styles/Main.css';

const BuildTheOrganization = () => {
  const [activeTopic, setActiveTopic] = useState('');
  const [activeSubtopic, setActiveSubtopic] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const [topicsData, setTopicsData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/data')
      .then(response => {
        // Filter for topic_id: 2
        const filteredData = response.data.filter(topic => topic.topic_id === 2);
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
    setActiveSubtopic(subtopic);
    const tabIndex = Object.values(topicsData.find(topic => topic.topic_name === activeTopic).subtopics).findIndex(st => st.subtopic_name === subtopic);
    setTabIndex(tabIndex);
  };

  return (
    <div>
      <h2>{activeTopic}</h2>

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
          navigation={{
            nextEl: '.next-button',
            prevEl: '.prev-button',
          }}
          onSlideChange={(swiper) => {
            const realIndex = swiper.realIndex;
            const currentSubtopic = Object.values(topicsData.find(topic => topic.topic_name === activeTopic).subtopics)[realIndex];
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
                        <button key={option.option_id} className="option-button">
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
    </div>
  );
};

export default BuildTheOrganization;
