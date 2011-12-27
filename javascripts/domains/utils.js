var Utils = {
  truncate_domain_name: function(domain_name, length) {
    length = (length || 25)
    name = domain_name.substring(0, length)
    if (domain_name.length > length)
      name = name + "..."
    return name;
  }
}