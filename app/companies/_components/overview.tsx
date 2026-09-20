type Props = {
  company: any
}

export default function CompanyOverview({ company }: Props) {
  return (
    <form id="companyForm" name="companyForm">
      <ul className="row list profile-card-grid">
        <li className="col s12 l6">
          <div className="card">
            <header>
              <i className="material-icons highlight">account_box</i>
              Overview
            </header>
            <div className="card-body">{company.overview}</div>
          </div>
        </li>
        <li className="col s12 l6">
          <div className="card">
            <header>
              <i className="material-icons highlight">account_box</i>
              Overview
            </header>
            <div className="card-body">{company.overview}</div>
          </div>
        </li>
      </ul>
    </form>
  )
}
