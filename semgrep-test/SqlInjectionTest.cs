using System.Data.Common;

public class SqlInjectionTest
{
    public void SearchUser(DbCommand command, string userInput)
    {
        command.CommandText =
            "SELECT * FROM Users WHERE Name = '" + userInput + "' ";
    }
}