export function ContactForm({ value, onChange }) {
    const handleChange = (field) => (e) => {
        onChange({ ...value, [field]: e.target.value })
    }

    return (
        <section className="input-section">
            <div className="input-section__header">
                <h2 className="input-section__title">Contact Information</h2>
                <span className="input-section__optional">Required</span>
            </div>
            <div className="create-contact-grid">
                <div className="input-field input-field--full">
                    <label htmlFor="create-name">Full Name *</label>
                    <input
                        type="text"
                        id="create-name"
                        placeholder="e.g., John Smith"
                        value={value.name}
                        onChange={handleChange('name')}
                    />
                </div>
                <div className="input-field">
                    <label htmlFor="create-email">Email</label>
                    <input
                        type="email"
                        id="create-email"
                        placeholder="john@example.com"
                        value={value.email}
                        onChange={handleChange('email')}
                    />
                </div>
                <div className="input-field">
                    <label htmlFor="create-phone">Phone</label>
                    <input
                        type="tel"
                        id="create-phone"
                        placeholder="+44 7123 456789"
                        value={value.phone}
                        onChange={handleChange('phone')}
                    />
                </div>
                <div className="input-field input-field--full">
                    <label htmlFor="create-location">Location</label>
                    <input
                        type="text"
                        id="create-location"
                        placeholder="e.g., London, UK"
                        value={value.location}
                        onChange={handleChange('location')}
                    />
                </div>
            </div>
        </section>
    )
}
