import React from 'react'

const Productscanner = () => {
  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh'
  };

  return (
    <form method="post" action="127.0.0.1:5000/upload" enctype="multipart/form-data" style={formStyle}>
      <div>
        <input type="file" name="image" placeholder="Enter Image" />
      </div>
      <div>
        <button type="submit">Submit</button>
      </div>
    </form>
  )
}

export default Productscanner