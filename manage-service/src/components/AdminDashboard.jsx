import React from "react";

const AdminDashboard = () => {
  const styles = {
    container: {
      padding: "40px",
      backgroundColor: "#f5f7fa",
      minHeight: "100vh",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    header: {
      fontSize: "2.5em",
      fontWeight: "bold",
      marginBottom: "0.5em",
      color: "#fff",
      textAlign: "center",
      backgroundColor: "#2c3e50",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    },
    subHeader: {
      fontSize: "1.2em",
      marginBottom: "2em",
      color: "#ecf0f1",
      textAlign: "center",
      backgroundColor: "#34495e",
      padding: "10px",
      borderRadius: "10px",
      width: "60%",
      margin: "20px auto",
    },
    welcomeSection: {
      backgroundColor: "#fff",
      padding: "40px",
      borderRadius: "10px",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      maxWidth: "800px",
      margin: "40px auto",
    },
    welcomeTitle: {
      fontSize: "2em",
      fontWeight: "bold",
      marginBottom: "0.5em",
      color: "#34495e",
      textAlign: "center",
    },
    welcomeMessage: {
      fontSize: "1.15em",
      color: "#7f8c8d",
      marginBottom: "1.5em",
      lineHeight: "1.6",
      textAlign: "center",
    },
    button: {
      backgroundColor: "#3498db",
      color: "#fff",
      padding: "15px 30px",
      border: "none",
      borderRadius: "5px",
      fontSize: "1em",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
      textDecoration: "none",
      display: "inline-block",
    },
    buttonHover: {
      backgroundColor: "#2980b9",
    },
    decorativeLine: {
      width: "60px",
      height: "5px",
      backgroundColor: "#3498db",
      margin: "20px auto",
      borderRadius: "5px",
    },
    // New style for centering the button
    buttonContainer: {
      textAlign: "center",
    },
  };

  // Handling hover effect with state
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Admin Dashboard</h1>
      <p style={styles.subHeader}>
        Manage your system efficiently and effectively
      </p>

      <div style={styles.welcomeSection}>
        <h2 style={styles.welcomeTitle}>Welcome, Admin!</h2>
        <div style={styles.decorativeLine}></div>
        <p style={styles.welcomeMessage}>
          Empower your medical store operations with our AI-powered management
          system. Navigate through the dashboard to access prescriptions,
          inventory, user management, and insightful reports. Your admin panel
          is designed to provide you with full control and transparency over all
          processes.
        </p>
        {/* Centering the Get Started button */}
        <div style={styles.buttonContainer}>
          <a
            href="/get-started"
            style={{
              ...styles.button,
              ...(isHovered ? styles.buttonHover : {}),
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Show Data
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
