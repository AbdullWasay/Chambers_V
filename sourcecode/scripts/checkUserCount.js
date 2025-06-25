// Script to check Cognito User Pool user count
// Run with: node scripts/checkUserCount.js

const { CognitoIdentityProviderClient, ListUsersCommand } = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient({ 
  region: "us-west-2",
  // Make sure you have AWS credentials configured
  // Either through AWS CLI, environment variables, or IAM roles
});

async function getUserCount() {
  try {
    const command = new ListUsersCommand({
      UserPoolId: "us-west-2_nTR3V58sX",
      Limit: 60 // Maximum users to fetch at once
    });

    let allUsers = [];
    let paginationToken = null;

    do {
      if (paginationToken) {
        command.input.PaginationToken = paginationToken;
      }

      const response = await client.send(command);
      allUsers = allUsers.concat(response.Users);
      paginationToken = response.PaginationToken;

      console.log(`Fetched ${response.Users.length} users...`);
    } while (paginationToken);

    console.log("\n=== USER POOL STATISTICS ===");
    console.log(`Total Users: ${allUsers.length}`);
    
    // Count by status
    const statusCounts = allUsers.reduce((acc, user) => {
      acc[user.UserStatus] = (acc[user.UserStatus] || 0) + 1;
      return acc;
    }, {});

    console.log("\nUsers by Status:");
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    // Show recent users
    console.log("\nRecent Users (last 5):");
    allUsers
      .sort((a, b) => new Date(b.UserCreateDate) - new Date(a.UserCreateDate))
      .slice(0, 5)
      .forEach(user => {
        const email = user.Attributes.find(attr => attr.Name === 'email')?.Value || 'No email';
        console.log(`  ${user.Username} (${email}) - ${user.UserStatus} - ${user.UserCreateDate}`);
      });

  } catch (error) {
    console.error("Error fetching users:", error.message);
    
    if (error.name === 'NotAuthorizedException') {
      console.log("\nMake sure you have proper AWS credentials configured:");
      console.log("1. Run 'aws configure' to set up credentials");
      console.log("2. Or set environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY");
      console.log("3. Or use IAM roles if running on EC2/Lambda");
    }
  }
}

getUserCount();
