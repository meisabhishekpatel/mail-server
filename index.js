const { SMTPServer } = require("smtp-server");
const simpleParser = require("mailparser").simpleParser;

// Store emails in memory (you can use a database instead)
const emails = [];

// Create SMTP Server
const server = new SMTPServer({
  // Allow insecure connections for testing
  secure: false,
  authOptional: true, // Disable authentication for testing

  // Handle client connection
  onConnect(session, callback) {
    console.log("Client connected:", session.remoteAddress);
    return callback(); // Accept the connection
  },

  // Handle MAIL FROM command
  onMailFrom(address, session, callback) {
    console.log("MAIL FROM:", address.address);
    return callback(); // Accept the sender
  },

  // Handle RCPT TO command
  onRcptTo(address, session, callback) {
    console.log("RCPT TO:", address.address);
    return callback(); // Accept the recipient
  },

  // Handle incoming data (email body)
  onData(stream, session, callback) {
    simpleParser(stream)
      .then((parsed) => {
        const email = {
          from: parsed.from.text,
          to: parsed.to.text,
          subject: parsed.subject,
          text: parsed.text,
          html: parsed.html,
        };
        emails.push(email); // Save the email in memory
        console.log("Received email:", email);

        // Notify the web app about the new email
        io.emit("newEmail", email); // Send real-time updates using Socket.io
      })
      .catch((err) => console.error("Parsing error:", err))
      .finally(() => {
        stream.on("end", callback); // Accept the data
      });
  },

  // Handle client disconnection
  onClose(session) {
    console.log("Client disconnected:", session.remoteAddress);
  },
});

// Start the server
const PORT = 25;
server.listen(PORT, () => {
  console.log(`SMTP server running on port ${PORT}`);
});

module.exports = { emails };
