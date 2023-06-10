function calculate() {
  const ipv = $('[data-tab].tab--active').dataset.tab == '0' ? 'v4' : 'v6';
  switch(ipv){
    case 'v4':{ 
      // 1. init & validate
      const subnet = input.get('subnet').raw().split(' ')[1].slice(1);
      const ipv4_address = input.get('ipv4_address').raw();
      const segments = ipv4_address.split('.'); 
      const ipv4_address_valid = 
        segments.length == 4 && segments.every(segment => {
          return Number(segment) <= 255 && RegExp(/^(0|[1-9]\d*)$/).test(segment);
        });
      if(!ipv4_address_valid){
        input.error('ipv4_address', 'Please provide a valid IPv4 address: a.b.c.d, where 0 <= a|b|c|d <= 255.');
      }
      if(!input.valid()) return;

      // 2. calculate
      const ipAddress = ipv4_address;
      const mask = 0xffffffff << (32 - subnet);
      const applyMask = (address, mask, mode = 'AND', format = 10) => {
        const segments = address.split('.');
        return segments.map((segment, index) => {
          const segmentMask = mask >> (8 * (3 - index)) & 0xff;
          const result = Number(mode == 'AND' ? segmentMask & segment : segmentMask | segment)
            .toString(format);
          return (format == 2 ? '0'.repeat(8-result.length) : '') + result; 
        }).join('.');
      }
      const networkAddress = applyMask(ipAddress, mask);
      const hexId = ipAddress.split('.').map(segment => {
        segment = Number(segment).toString(16);
        return '0'.repeat(2-segment.length) + segment;
      }).join('');
      const binId = '0'.repeat(32-Number('0x'+hexId).toString(2).length)+Number('0x'+hexId).toString(2);
      const integerId = Number('0x'+hexId);
      const broadcastAddress = applyMask(networkAddress, ~mask, 'OR');
      const shortAddress = `${ipAddress} /${subnet}`;
      const arpaAddress = `${ipAddress.split('.').reverse().join('.')}.in-addr.arpa`;
      const totalHosts = math.pow(2, 32 - subnet);
      const usableHosts = subnet <= 31 ? math.pow(2, 32 - subnet) - 2 : 0;
      const mappedAddress = `::ffff:${hexId.slice(0,4)}.${hexId.slice(4)}`;
      const _6to4prefix = `2002:${hexId.slice(0,4)}.${hexId.slice(4)}::/48`;
      const subnetMask = applyMask('255.255.255.255',mask);
      const ipClass = subnet >= 24 ? 'C' : (subnet >= 16 ? 'B' : (subnet >= 8 ? 'A' : 'Any'));
      const wildcardMask = applyMask('255.255.255.255',~mask);
      const cidrNotation = `/${subnet}`;
      const usableHostRange = subnet <= 30 ? 
        applyMask(networkAddress, 1, 'OR') + ' - ' + applyMask(networkAddress, ~(mask | 1), 'OR') : 'NA';
      const binaryMask = applyMask('255.255.255.255',mask,'AND',2);

      // 3. output
      _('ipv4_ip_address').innerHTML = ipAddress;
      _('ipv4_short_address').innerHTML = shortAddress;
      _('ipv4_type').innerHTML = 'Public';
      _('ipv4_hex_id').innerHTML = '0x' + hexId;
      _('ipv4_integer_id').innerHTML = integerId;
      _('ipv4_net_address').innerHTML = networkAddress;
      _('ipv4_broadcast_address').innerHTML = broadcastAddress;
      _('ipv4_arpa_address').innerHTML = arpaAddress;
      _('ipv4_total_hosts').innerHTML = totalHosts;
      _('ipv4_mapped_address').innerHTML = mappedAddress;
      _('ipv4_usable_hosts').innerHTML = usableHosts;
      _('ipv4_6to4_prefix').innerHTML = _6to4prefix;
      _('ipv4_subnet_mask').innerHTML = subnetMask;
      _('ipv4_ip_class').innerHTML = ipClass;
      _('ipv4_wildcard_mask').innerHTML = wildcardMask;
      _('ipv4_cidr_notation').innerHTML = cidrNotation;
      _('ipv4_usable_host_range').innerHTML = usableHostRange;
      _('ipv4_binary_id').innerHTML = binId;
      _('ipv4_binary_mask').innerHTML = binaryMask;
    }break;

    case 'v6':{ 
      // 1. init & validate
      const prefix_length = input.get('prefix_length').raw().slice(1);
      const ipv6_address = input.get('ipv6_address').raw();
      const segments = ipv6_address.replace('::',':').split(':');
      const ipv6_address_valid = 
        (
          (ipv6_address.match(/::/g)||[]).length == 1 ? segments.length >= 2 && segments.length <= 8 : segments.length == 8
        ) && 
        segments.every(segment => {
          return segment == '' || RegExp(/^[0-9a-fA-F]{1,4}$/).test(segment)
        });
      if(!ipv6_address_valid){
        input.error('ipv6_address', 'Please provide a valid IPv6 address: a:b:c:d:e:f:g:h or shortened format using :: for omitting zero-segments (e.g. a::h), where 0 <= a|b|c|d|e|f|g|h <= ffff.');
      }
      if(!input.valid()) return;

      // 2. calculate
      const ipAddress = `${ipv6_address}/${prefix_length}`;
      const fullIpAddress = ipv6_address
        .replace('::', 
          (ipv6_address[0] == ':' ? '0:' : ':') + 
          Array(8 - ipv6_address.replace('::',':').split(':').length).fill('0').join(':') + 
          (ipv6_address[ipv6_address.length-1] == ':' ? ':0' : ':')
        )
        .split(':').map(segment => '0'.repeat(4 - segment.length) + segment).join(':')
      ; // aaaa:bbbb:cccc:dddd:eeee:ffff:gggg:hhhh
      const mask = '1'.repeat(prefix_length) + '0'.repeat(128-prefix_length); 
      const applyMask = (address, mask, mode = 'AND') => {
        return address.split(':')
          .map((segment, index) => {
            const segmentMask = Number('0b'+mask.slice(16*index, 16*(index+1)));
            const result = (mode == 'AND' ? Number('0x'+segment) & segmentMask : Number('0x'+segment) | segmentMask).toString(16);
            return '0'.repeat(4-result.length)+result;
          }).join(':');
      }
      const networkAddress = applyMask(fullIpAddress, mask).split(':')
        .slice(0, math.ceil(prefix_length / 16)).join(':');
      const network = networkAddress + (networkAddress.split(':').length < 8 ? '::' : '');
      const total = (power) => math.pow(2,math.bignumber(power)).toFixed();
      const totalAddresses = total(128-prefix_length);
      const totalNetworks = prefix_length < 64 ? total(64-prefix_length) : '';
      const ipRange = applyMask(fullIpAddress, mask) + ' - ' + 
        applyMask(fullIpAddress, '0'.repeat(prefix_length) + '1'.repeat(128-prefix_length), 'OR');

      // 3. output
      _('ipv6_ip_address').innerHTML = ipAddress;
      _('ipv6_full_ip_address').innerHTML = fullIpAddress;
      _('ipv6_total_addresses').innerHTML = totalAddresses;
      _('ipv6_total_networks').innerHTML = totalNetworks;
      _('ipv6_network').innerHTML = network;
      _('ipv6_ip_range').innerHTML = ipRange;
    }break;
  }
}

_('network_class').onchange = networkClass => {
  const subnetsCount = {
    any: 32, a: 25, b: 17, c: 9
  }[networkClass];
  
  const subnets = Array(subnetsCount).fill('').map((item, index)=>{
    const	value = 0xffffffff << index;
    const label = `${value >> 24 & 0xff}.${value >> 16 & 0xff}.${value >> 8 & 0xff}.${value & 0xff} /${32 - index}`;
    return `<option value="${label}">${label}</option>`;
  }).join("");

  _('subnet').innerHTML = subnets;
  _('subnet').parentNode.parentNode.querySelector('div.input-hints span').innerText = "Subnets count: " + subnetsCount;
}
