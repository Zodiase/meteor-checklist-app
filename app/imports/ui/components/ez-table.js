import React from 'react';
import PropTypes from 'prop-types';
import objectPath from 'object-path';

export default class NewComponent extends React.Component {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    idField: PropTypes.string,
    columns: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string,
      field: PropTypes.string.isRequired,
      // Transform field value to the display content.
      transform: PropTypes.func,
      // General style for the column.
      style: PropTypes.object,
      // Style specific for the header row.
      headerStyle: PropTypes.object,
      // Style specific for the body rows.
      bodyStyle: PropTypes.object,
    })).isRequired,
  };

  static defaultProps = {
    idField: 'id',
  };

  static defaultTransform = (rawValue) => String(rawValue);

  renderColumnCell = (item, column) => {
    const columnId = column.id;
    const rawValue = objectPath.get(item, column.field);
    const transform = column.transform || this.constructor.defaultTransform;
    const content = transform(rawValue, item);

    return (
      <td
        key={columnId}
        style={{
          ...column.style,
          ...column.bodyStyle,
        }}
      >
        {content}
      </td>
    );
  };

  renderRow = (item) => {
    const itemId = item[this.props.idField];

    return (
      <tr key={`item__${itemId}`}>{this.props.columns.map((col) => this.renderColumnCell(item, col))}</tr>
    );
  };

  renderHeaderColumnCell = (column) => (
    <td
      key={column.id}
      style={{
        ...column.style,
        ...column.headerStyle,
      }}
    >
      {column.title}
    </td>
  );

  renderHeaderRow () {
    return (
      <tr key="header">{this.props.columns.map(this.renderHeaderColumnCell)}</tr>
    );
  }

  render () {
    return (
      <table>
        <thead>{this.renderHeaderRow()}</thead>
        <tbody>{this.props.data.map(this.renderRow)}</tbody>
      </table>
    );
  }
}
