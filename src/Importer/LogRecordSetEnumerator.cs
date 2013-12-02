using System;
using System.Collections;
using System.Collections.Generic;
using MSUtil;

namespace Importer
{
    /// <summary>
    /// An enumerator for logrecordset, to tidy up code elsewhere
    /// </summary>
    public class LogRecordSetEnumerator : IEnumerator<ILogRecord>
    {
        private ILogRecordset _records;

        public LogRecordSetEnumerator(ILogRecordset set)
        {
            _records = set;
        }

        public void Dispose()
        {
            _records.close();
        }

        public bool MoveNext()
        {
            if (!_records.atEnd())
            {
                _records.moveNext();
                return true;
            }

            return false;
        }

        public void Reset()
        {
            throw new NotImplementedException();
        }

        public ILogRecord Current { get { return _records.getRecord(); } }

        object IEnumerator.Current
        {
            get { return Current; }
        }
    }
}