using System.Collections;
using System.Collections.Generic;
using MSUtil;

namespace Importer
{
    public class EnumerableLogRecordSet : IEnumerable<ILogRecord>
    {
        private readonly LogRecordSetEnumerator _enumerator;

        public EnumerableLogRecordSet(ILogRecordset records)
        {
            _enumerator = new LogRecordSetEnumerator(records);
        }

        public IEnumerator<ILogRecord> GetEnumerator()
        {
            return _enumerator;
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }
    }
}