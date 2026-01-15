import React from 'react';
import { Card, Row, Col, Table } from 'react-bootstrap';

function QuickReference() {
  return (
    <div className="quick-reference">
      <Row>
        <Col xs={12} lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h3 style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>
                <i className="fas fa-hammer me-2"></i>Construction Costs
              </h3>
            </Card.Header>
            <Card.Body>
              <div style={{ overflowX: 'auto' }}>
                <Table striped bordered size="sm" style={{ minWidth: '300px' }}>
                  <thead>
                    <tr>
                      <th style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Structure</th>
                      <th style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Cost</th>
                      <th style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Time</th>
                    </tr>
                  </thead>
                <tbody>
                  <tr>
                    <td>Castle Wall (100')</td>
                    <td>2,000 gp</td>
                    <td>10 days</td>
                  </tr>
                  <tr>
                    <td>Wood Wall (100')</td>
                    <td>400 gp</td>
                    <td>2 days</td>
                  </tr>
                  <tr>
                    <td>Gatehouse</td>
                    <td>2,600 gp</td>
                    <td>13 days</td>
                  </tr>
                  <tr>
                    <td>Barbican</td>
                    <td>14,800 gp</td>
                    <td>74 days</td>
                  </tr>
                  <tr>
                    <td>Tower, Round (narrow)</td>
                    <td>6,000 gp</td>
                    <td>30 days</td>
                  </tr>
                  <tr>
                    <td>Tower, Round (wide)</td>
                    <td>12,000 gp</td>
                    <td>60 days</td>
                  </tr>
                  <tr>
                    <td>Keep, Square</td>
                    <td>30,000 gp</td>
                    <td>150 days</td>
                  </tr>
                  <tr>
                    <td>Building, Stone</td>
                    <td>1,200 gp</td>
                    <td>6 days</td>
                  </tr>
                  <tr>
                    <td>Building, Wood</td>
                    <td>600 gp</td>
                    <td>3 days</td>
                  </tr>
                  <tr>
                    <td>Moat, Filled (100')</td>
                    <td>320 gp</td>
                    <td>1.6 days</td>
                  </tr>
                </tbody>
                </Table>
              </div>
              <small className="text-muted" style={{ fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)' }}>
                <strong>Construction Time:</strong> 1 day per 200 gp<br />
                <strong>Engineer Cost:</strong> 300 gp/month (1 per 40,000 gp)
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h3 style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>
                <i className="fas fa-shield-alt me-2"></i>Mercenary Costs
              </h3>
            </Card.Header>
            <Card.Body>
              <div style={{ overflowX: 'auto' }}>
                <Table striped bordered size="sm" style={{ minWidth: '300px' }}>
                  <thead>
                    <tr>
                      <th style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Type</th>
                      <th style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Peace</th>
                      <th style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>War</th>
                    </tr>
                  </thead>
                <tbody>
                  <tr>
                    <td>Normal Man</td>
                    <td>4 sp</td>
                    <td>8 sp</td>
                  </tr>
                  <tr>
                    <td>Archer</td>
                    <td>2 gp</td>
                    <td>4 gp</td>
                  </tr>
                  <tr>
                    <td>Footman, Light</td>
                    <td>8 sp</td>
                    <td>16 sp</td>
                  </tr>
                  <tr>
                    <td>Footman, Heavy</td>
                    <td>12 sp</td>
                    <td>24 sp</td>
                  </tr>
                  <tr>
                    <td>Crossbowman</td>
                    <td>16 sp</td>
                    <td>32 sp</td>
                  </tr>
                  <tr>
                    <td>Longbowman</td>
                    <td>4 gp</td>
                    <td>8 gp</td>
                  </tr>
                  <tr>
                    <td>Horseman, Light</td>
                    <td>8 gp</td>
                    <td>16 gp</td>
                  </tr>
                  <tr>
                    <td>Horseman, Medium</td>
                    <td>8 gp</td>
                    <td>16 gp</td>
                  </tr>
                  <tr>
                    <td>Horseman, Heavy</td>
                    <td>12 gp</td>
                    <td>24 gp</td>
                  </tr>
                </tbody>
                </Table>
              </div>
              <small className="text-muted" style={{ fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)' }}>
                Costs are per month. Wartime = Active combat/siege.
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xs={12} lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h3 style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>
                <i className="fas fa-user-tie me-2"></i>Official Costs
              </h3>
            </Card.Header>
            <Card.Body>
              <div style={{ overflowX: 'auto' }}>
                <Table striped bordered size="sm" style={{ minWidth: '300px' }}>
                  <thead>
                    <tr>
                      <th style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Official</th>
                      <th style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Cost/Month</th>
                    </tr>
                  </thead>
                <tbody>
                  <tr>
                    <td>Seneschal</td>
                    <td>1,600 gp</td>
                  </tr>
                  <tr>
                    <td>Guard Captain</td>
                    <td>1,600+ gp</td>
                  </tr>
                  <tr>
                    <td>Castellan</td>
                    <td>800 gp</td>
                  </tr>
                  <tr>
                    <td>Chief Magistrate</td>
                    <td>800 gp</td>
                  </tr>
                  <tr>
                    <td>Chief Steward</td>
                    <td>400 gp</td>
                  </tr>
                  <tr>
                    <td>Engineer</td>
                    <td>300 gp</td>
                  </tr>
                  <tr>
                    <td>Reeve</td>
                    <td>200 gp</td>
                  </tr>
                  <tr>
                    <td>Chaplain</td>
                    <td>200 gp</td>
                  </tr>
                  <tr>
                    <td>Servitors</td>
                    <td>2 gp</td>
                  </tr>
                </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h3 style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>
                <i className="fas fa-coins me-2"></i>Income Rates
              </h3>
            </Card.Header>
            <Card.Body>
              <div style={{ overflowX: 'auto' }}>
                <Table striped bordered size="sm" style={{ minWidth: '300px' }}>
                  <thead>
                    <tr>
                      <th style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Income Type</th>
                      <th style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Rate</th>
                    </tr>
                  </thead>
                <tbody>
                  <tr>
                    <td>Standard Income</td>
                    <td>4 gp/family/month</td>
                  </tr>
                  <tr>
                    <td>Tax Income</td>
                    <td>4 sp/family/month (standard)</td>
                  </tr>
                  <tr>
                    <td>Animal Resources</td>
                    <td>8 sp/family/month</td>
                  </tr>
                  <tr>
                    <td>Vegetable Resources</td>
                    <td>4 sp/family/month</td>
                  </tr>
                  <tr>
                    <td>Mineral Resources</td>
                    <td>12 sp/family/month</td>
                  </tr>
                  <tr style={{ backgroundColor: 'var(--sd-medium-gray)' }}>
                    <td><strong>Payment to Liege</strong></td>
                    <td><strong>20% of ALL income</strong></td>
                  </tr>
                  <tr style={{ backgroundColor: 'var(--sd-medium-gray)' }}>
                    <td><strong>Theocracy Tithe</strong></td>
                    <td><strong>10% of ALL income</strong></td>
                  </tr>
                </tbody>
                </Table>
              </div>
              <small className="text-muted" style={{ fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)' }}>
                <strong>XP Earned:</strong> (Tax + Resource Income) ÷ 100 per month
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xs={12} className="mb-4">
          <Card>
            <Card.Header>
              <h3 style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>
                <i className="fas fa-chart-line me-2"></i>Population Growth
              </h3>
            </Card.Header>
            <Card.Body>
              <div style={{ overflowX: 'auto' }}>
                <Table striped bordered size="sm" style={{ minWidth: '300px' }}>
                  <thead>
                    <tr>
                      <th style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Current Families</th>
                      <th style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Monthly Growth Rate</th>
                    </tr>
                  </thead>
                <tbody>
                  <tr>
                    <td>1-100</td>
                    <td>±25%</td>
                  </tr>
                  <tr>
                    <td>101-200</td>
                    <td>±20%</td>
                  </tr>
                  <tr>
                    <td>201-300</td>
                    <td>±15%</td>
                  </tr>
                  <tr>
                    <td>301-400</td>
                    <td>±10%</td>
                  </tr>
                  <tr>
                    <td>401-500</td>
                    <td>±5%</td>
                  </tr>
                  <tr>
                    <td>500+</td>
                    <td>±1d6%</td>
                  </tr>
                </tbody>
                </Table>
              </div>
              <small className="text-muted" style={{ fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)' }}>
                Roll 1d10: 1-5 = lose the %, 6-10 = gain the %
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default QuickReference;
