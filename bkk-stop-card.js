
import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class BKKStopCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
    };
  }

  static get styles() {
    return css`
      table {
        width: 100%;
        padding: 0px 36px 16px 0px;
        border: none;
        margin-left: 16px;
        margin-right: 16px;
      }
      table tr:nth-child(odd) {
        background-color: var(--card-background-color, var(--ha-card-background, var(--paper-card-background-color, #fff)));
        vertical-align: middle;
      }
      table tr:nth-child(even) td:not(.bpgo) {
        background-color: var(--secondary-background-color);
      }
      td {
        padding-left: 5px;
      }
      .highlight {
        font-size: 100%;
      }
      .vehicle {
        width: 1.8em;
        text-align: center;
        vertical-align: middle;
        padding: 3px 3px 3px 3px;
        border-radius: 3px;
        color: #ffffff;
      }
      .emp {
        font-weight: bold;
        font-size: 120%;
      }
      .extraic {
        width: 1em;
        padding-left: 5px;
      }
      .bus {
        color: #44739e;
        width: 0.1em;
      }
      .bus_bpgo {
        background-color: #009FE3;
      }
      .bus_bpgo_night {
        background-color: #000000;
      }
      .trolleybus {
        color: #cc0000;
        width: 1.5em;
      }
      .trolleybus_bpgo {
        background-color: #E5231B;
      }
      .tram {
        color: #e1e100;
        width: 1.5em;
      }
      .tram_bpgo {
        background-color: #FFD500;
      }
      .rail {
        color: #2ecc71;
        width: 1.5em;
      }
      .rail_bpgo {
        background-color: #2ECC71;
      }
      .rail_bpgo_H5 {
        background-color: rgb(138,35,108);
        border-radius: 50%;
        padding-left: 3px;
      }
      .rail_bpgo_H6 {
        background-color: rgb(123,68,0);
        border-radius: 50%;
        padding-left: 3px;
      }
      .rail_bpgo_H7 {
        background-color: rgb(238,113,1);
        border-radius: 50%;
        padding-left: 3px;
      }
      .rail_bpgo_H8 {
        background-color: rgb(237,110,134);
        border-radius: 50%;
        padding-left: 3px;
      }
      .subway {
        width: 1.5em;
      }
      .subway_bpgo_M1 {
        background-color: #ffd800;
        border-radius: 50%;
        padding-left: 5px;
      }
      .subway_bpgo_M2 {
        background-color: #e41f18;
        border-radius: 50%;
        padding-left: 5px;
      }
      .subway_bpgo_M3 {
        background-color: rgb(0,92,165);
        border-radius: 50%;
        padding-left: 5px;
      }
      .subway_bpgo_M4 {
        background-color: rgb(76,162,47);
        border-radius: 50%;
        padding-left: 5px;
      }
      .arrival-time {
        text-align: right;
      }
      .estimated {
        color: #208C4E;
      }
      .h_station {
        padding-left: 5em;
        padding-bottom: 15px;
        display: inline-block;
        float: left;
      }
      .refresh {
        display: inline-block;
        margin-left: auto;
        margin-right: 20px;
        margin-top: -5px;
        float: right;
        padding: 4px;
        border-radius: 20%;
        color: var(--primary-text-color);
        cursor: pointer;
      }
    `;
  }

  _getAttributes(hass, entity) {
    const res = [];
    const max_items = this.config.max_items || 0;
    const stateObj = hass.states[entity];

    if (stateObj && stateObj.attributes) {
      const data1 = stateObj.attributes['vehicles'] || [];
      const station = stateObj.attributes['stationName'] || 'Unknown';

      if (data1.length > 0) {
        const nr_of_items = max_items > 0 ? Math.min(data1.length, max_items) : data1.length;

        for (let i = 0; i < nr_of_items; i++) {
          // Changed to booleans because Lit handles raw HTML insertion differently
          let bikes = data1[i].hasOwnProperty('bikesAllowed');
          let wheelchair = data1[i].hasOwnProperty('wheelchair');
          let nightbus = "";

          let icon = data1[i].type ? data1[i].type.toLowerCase() : 'bus';
          const vehicle = icon;

          if (icon === "trolleybus") {
            icon = "bus";
          } else if (icon === "rail") {
            icon = "train";
          }

          if (vehicle === "bus" && /^(6|9[0-9]{2}[A-Z]?)$/.test(data1[i].routeid)) {
            nightbus = "_night";
          }

          let key = data1[i].routeid;
          let extra_css_class = "";

          if (vehicle === "subway") {
            key = "M" + data1[i].routeid;
            extra_css_class = "_" + key;
          } else if (vehicle === "rail") {
            key = "H" + data1[i].routeid;
            extra_css_class = "_" + key;
          }

          res.push({
            attime: data1[i].attime,
            predicted_attime: data1[i].predicted_attime,
            bikes: bikes,
            headsign: data1[i].headsign,
            inmin: data1[i].in,
            icon: icon,
            key: key,
            station: station,
            vehicle: vehicle,
            wheelchair: wheelchair,
            nightbus: nightbus,
            extra_css_class: extra_css_class
          });
        }
      } else {
        res.push({
          key: 'No service',
          vehicle: '',
          inmin: 'following',
          headsign: 'any destination',
          nightbus: '',
          wheelchair: false,
          bikes: false,
          icon: '',
          attime: '',
          predicted_attime: '',
          station: station,
          extra_css_class: ''
        });
      }
    }
    return res;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Please define an entity');
    }
    this.config = config;
  }

  render() {
    if (!this.config || !this.hass) {
      return html``;
    }

    const stateObj = this.hass.states[this.config.entity];
    if (!stateObj) {
      return html`<ha-card><div class="card-content">Entity not found: ${this.config.entity}</div></ha-card>`;
    }

    const attributes = this._getAttributes(this.hass, this.config.entity);
    const stationName = this.config.name || (attributes.length ? attributes[0].station : 'Unknown');

    const hide_predicted_at_time = this.config.hide_predicted_at_time ?? false;
    const hide_in_mins = this.config.hide_in_mins ?? false;
    const hide_at_time = this.config.hide_at_time ?? true;
    const layout_bpgo = this.config.layout_bpgo ?? false;

    return html`
      <ha-card>
        <div id="station_container" style="padding-top:15px;">
          <div id="station_name" class="h_station emp">${stationName}</div>
          <div class="refresh">
            <ha-icon icon="mdi:sync" @click="${this._refresh}"></ha-icon>
          </div>
        </div>
        <table>
          <tbody>
            ${attributes.map(attr => {
              if (layout_bpgo) {
                return html`
                  <tr>
                    <td class="highlight vehicle bpgo ${attr.vehicle}_bpgo${attr.nightbus}${attr.extra_css_class}">${attr.key}</td>
                    <td class="bpgo">${attr.headsign}</td>
                    <td class="highlight arrival-time ${attr.predicted_attime ? "estimated" : ''}">${attr.inmin}'</td>
                  </tr>
                `;
              } else {
                return html`
                  <tr>
                    <td class="${attr.vehicle}">
                      <ha-icon class="${attr.vehicle}" icon="mdi:${attr.icon}"></ha-icon>
                    </td>
                    <td>
                      <span class="emp">${attr.key}</span> to ${attr.headsign}
                      ${!hide_in_mins ? html`in ${attr.inmin} mins ` : ''}
                      ${!hide_at_time ? html`at ${attr.attime} ` : ''}
                      ${!hide_predicted_at_time ? html`${attr.predicted_attime ? `at ${attr.predicted_attime} (est.) ` : `at ${attr.attime} `}` : ''}
                      ${attr.wheelchair ? html`<ha-icon icon="mdi:wheelchair-accessibility" class="extraic"></ha-icon>` : ''}
                      ${attr.bikes ? html`<ha-icon icon="mdi:bike" class="extraic"></ha-icon>` : ''}
                    </td>
                  </tr>
                `;
              }
            })}
          </tbody>
        </table>
      </ha-card>
    `;
  }

  _refresh() {
    this.hass.callService('bkk_stop', 'refresh', { entity_id: this.config.entity });
  }

  getCardSize() {
    return 1;
  }
}

customElements.define('bkk-stop-card', BKKStopCard);
