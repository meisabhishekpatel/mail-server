const { SMTPServer } = require("smtp-server");
const simpleParser = require("mailparser").simpleParser;

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
        console.log("Subject:", parsed.subject);
        console.log("From:", parsed.from.text);
        console.log("To:", parsed.to.text);
        console.log("Text:", parsed.text);
        console.log("HTML:", parsed.html);
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
