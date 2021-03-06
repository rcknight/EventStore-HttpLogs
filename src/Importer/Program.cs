﻿using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using EventStore.ClientAPI;
using EventStore.ClientAPI.Common.Utils;
using MSUtil;
using Newtonsoft.Json.Linq;


namespace Importer
{
    class Program
    {
        static void Main(string[] args)
        {
            if (args.Length != 1)
            {
                Console.WriteLine("Please supply a query as the first argument");
                Console.WriteLine("Eg: Importer.exe \"select * from c:\\logs\\w3c\\*.*\"");
            }
            else
            {
                var query = args[0];
                try
                {
                    var settings = ConnectionSettings.Create();
                    var conn = EventStoreConnection.Create(settings, new IPEndPoint(IPAddress.Loopback, 1113));
                    conn.ConnectAsync().Wait();
                    var processor = new LogProcessor(conn);

                    var totalLines = processor.ProcessLogs(query);
                    Console.WriteLine(totalLines);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error parsing log files");
                    Console.WriteLine(ex.GetType());
                    Console.WriteLine(ex.Message);
                    Console.WriteLine(ex.StackTrace);
                }
            }
            
            Console.ReadLine();
        }
    }

    public class LogProcessor
    {
        private IEventStoreConnection _connection;

        public LogProcessor(IEventStoreConnection connection)
        {
            _connection = connection;
        }

        public int ProcessLogs(string query)
        {
            LogQueryClass log = new LogQueryClass();

            //the input context class type will need changing depending on the type of log
            var recordSet = log.Execute(query, new COMW3CInputContextClass());

            var enumerableSet = new EnumerableLogRecordSet(recordSet);

            var columnCount = recordSet.getColumnCount();

            var lastFileName = "File Name";
            var lastFileResultCount = 0;
            var totalLines = 0;
            var toWrite = new List<EventData>();
            foreach (var record in enumerableSet)
            {
                totalLines++;
                var result = new JObject();
                for (int i = 0; i < columnCount; i++)
                {
                    var value = record.getValue(i);
                    if (value.GetType() != typeof(DBNull))
                    {
                        var colName = recordSet.getColumnName(i);
                        
                        if (colName.Equals("LogFilename")) {
                            if (lastFileName.Equals(value))
                            {
                                lastFileResultCount++;
                            }
                            else
                            {
                                _connection.AppendToStreamAsync("logEvents", ExpectedVersion.Any, toWrite).Wait();
                                //toWrite.Clear();
                                
                                Console.WriteLine("File {0} - {1} entries", lastFileName, toWrite.Count);
                                toWrite = new List<EventData>();
                                lastFileName = value;
                                lastFileResultCount = 1;
                            }
                        } 
                        result[colName] = value; 
                    }
                }

                toWrite.Add(ToEvent(result));
            }

            return totalLines;
        }

        private readonly Encoding encoding = Encoding.UTF8;

        private EventData ToEvent(JObject logRecord)
        {
            var eventBytes = encoding.GetBytes(logRecord.ToString());
            var metaData = new byte[]{};

            return new EventData(Guid.NewGuid(), "LogRecord", true, eventBytes, metaData);
        }
    }
}
