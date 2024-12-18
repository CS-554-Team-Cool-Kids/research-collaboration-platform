import React from "react";
import { Link } from "react-router-dom";
import headerImage from "../../assets/images/collab_home_image.png";
import collabIcon from "../../assets/images/collab_icon.png";
import chatIcon from "../../assets/images/chat_icon.png";
import newsfeedIcon from "../../assets/images/newsfeed_icon.png";
import noImage from "../../assets/images/no_image.png";

const Home = () => {
  return (
    <main className="home-page">
      <div className="container">

        {/* Header */}
        <header className="text-img-flex">
          <div className="text-wrapper">
            <h1>Research Collaboration</h1>
            <p>Our research collaboration platform is designed to facilitate meaningful connections between professors and students at Stevens Institute of Technology, enabling them toc collaborate on research projects.</p>
            <Link className="btn btn-primary" to="/Auth/Register">Register</Link>
          </div>
          <div className="img-wrapper">
            <img src={headerImage} className="img-flex"/>
          </div>
        </header>

        {/* Features */}
        <section className="card-section">
          <h2>Features</h2>
          <div className="card-wrapper">

            <div className="purple-card">
              <img src={collabIcon} className="card-icon" alt="Collaboration Icon" />
              <div>
                <h3>Collaboration</h3>
                <p>Professors can post details about their resesarch needs, while students seeking practical experience can browser and apply for relevant projects.</p>
              </div>
            </div>

            <div className="purple-card">
              <img src={chatIcon} className="card-icon" alt="Chat Icon" />
              <div>
                <h3>Messaging Tool</h3>
                <p>Students and professors can collaborate and discuss project details seamlessly using the integrated messaging tool.</p>
              </div>
            </div>

            <div className="purple-card">
              <img src={newsfeedIcon} className="card-icon" alt="Newsfeed Icon" />
              <div>
                <h3>Newsfeed</h3>
                <p>Stay informed on current and upcoming projects with the streamlined news feed feature.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tile Section */}
        <section className="tile-section">
  
          <div className="tile-wrapper">
            <div className="tile-text">
              <h2>Professors</h2>
              <p>Professors can share project details and descriptions to attract assistance from prospective students. They can post updates on ongoing projects, utilize our intuitive project management tools to streamline their workflow, and review detailed profiles to prospective students before accepting collaboration requests.</p>
              <Link className="btn btn-primary" to="../auth/register">Sign Up</Link>
            </div>
            <div className="tile-img">
              <img src={noImage} alt="Professor Profile Sample" />
            </div>
          </div>

          <div className="tile-wrapper">
            <div className="tile-text">
              <h2>Students</h2>
              <p>Students can explore projects that align with their interests and goals using advanced search filters. They can stay informed about updates on projects they are involved in, as well as prospective opportunities. Our integrated messaging tools enable seamless communication with team members and professors, fostering collaboration and engagement throughout the project lifecycle.</p>
              <Link className="btn btn-primary" to="../auth/register">Sign Up</Link>
            </div>
            <div className="tile-img">
              <img src={noImage} alt="Student Profile Sample"/>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
};

export default Home;
